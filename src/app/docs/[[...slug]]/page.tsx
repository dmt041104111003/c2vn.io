import { source } from "~/app/lib/source";
import { DocsPage, DocsBody, DocsDescription, DocsTitle } from "fumadocs-ui/page";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getMDXComponents } from "~/mdx-components";

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  console.log("params", params);
  if (!page) notFound();

  console.log("page", page);
  const MDXContent = page.data.body;
  const segments = Array.isArray(params.slug) ? params.slug : [];
  const filePath = segments.length === 0 ? "index.mdx" : `${segments.join("/")}.mdx`;
  const editBase = process.env.NEXT_PUBLIC_DOCS_EDIT_BASE || 'https://github.com/cardano2vn/website/edit/main/content/docs';
  const editUrl = `${editBase}/${filePath}`;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>
        {page.data.description}
        <span className="ml-3 text-xs">
          <Link
            href={editUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 underline underline-offset-2"
          >
            Edit this doc
          </Link>
        </span>
      </DocsDescription>

      <DocsBody>
        <MDXContent
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
