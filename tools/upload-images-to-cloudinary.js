require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];

async function uploadImageToCloudinary(imagePath, targetFolder) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: targetFolder,
      use_filename: true,
      unique_filename: true
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${imagePath}:`, error.message);
    return null;
  }
}

function getImageFiles(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    return files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return SUPPORTED_EXTENSIONS.includes(ext);
      })
      .map(file => path.join(folderPath, file))
      .sort();
  } catch (error) {
    console.error(`Error reading directory ${folderPath}:`, error.message);
    return [];
  }
}

async function uploadImagesAndGetMarkdown(folderPath, targetFolder) {
  const imageFiles = getImageFiles(folderPath);
  
  if (imageFiles.length === 0) {
    console.log('No image files found in the specified folder');
    return '';
  }

  const markdownLines = [];
  let uploadedCount = 0;
  
  for (const imagePath of imageFiles) {
    const fileName = path.basename(imagePath);
    const cloudinaryUrl = await uploadImageToCloudinary(imagePath, targetFolder);
    
    if (cloudinaryUrl) {
      markdownLines.push(`<img src="${cloudinaryUrl}" alt="Cloudinary Image" width="800" height="600" style={{maxWidth: "100%", height: "auto"}} />`);
      uploadedCount++;
    } else {
      console.log(`Failed to upload: ${fileName}`);
    }
  }
  
  console.log(`\nUpload completed! ${uploadedCount}/${imageFiles.length} images uploaded successfully`);
  return markdownLines.join('\n\n');
}


async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    return;
  }
  
  const folderPath = args[0];
  let targetFolder = 'events';
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--folder' || a === '-f') {
      if (i + 1 < args.length) {
        targetFolder = args[i + 1];
        i++;
      }
    } else if (a.startsWith('--folder=')) {
      targetFolder = a.split('=')[1] || targetFolder;
    } else if (!a.startsWith('-') && i === 1) {
      targetFolder = a;
    }
  }
  if (!fs.existsSync(folderPath)) {
    console.error(`Folder not found: ${folderPath}`);
    return;
  }
  
  if (!fs.statSync(folderPath).isDirectory()) {
    console.error(`Path is not a directory: ${folderPath}`);
    return;
  }
  
  try {
    const markdown = await uploadImagesAndGetMarkdown(folderPath, targetFolder);
    
    if (markdown) {
      console.log(`\nGenerated Image Tags (folder: ${targetFolder}):`);
      console.log('='.repeat(50));
      console.log(markdown);
      console.log('='.repeat(50));
      const outputFile = path.join(folderPath, 'image-tags.txt');
      if (fs.existsSync(outputFile)) {
        fs.appendFileSync(outputFile, '\n' + markdown);
        console.log(`\nImage tags appended to: ${outputFile}`);
      } else {
        fs.writeFileSync(outputFile, markdown);
        console.log(`\nImage tags saved to: ${outputFile}`);
      }
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  uploadImagesAndGetMarkdown,
  uploadImageToCloudinary,
  getImageFiles
};
