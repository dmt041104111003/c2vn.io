{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  nativeBuildInputs = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.nodePackages.typescript
    pkgs.prisma
    # Hercules CI Agent
    pkgs.hci
  ];
  
  shellHook = ''
    echo "Hercules CI Development Environment"
    echo "Node.js: $(node --version)"
    echo "NPM: $(npm --version)"
    echo "HCI: $(hci --version)"
    echo ""
    echo "Commands:"
    echo "  hci login     - Login to Hercules CI"
    echo "  hci secret add - Add secrets"
    echo "  npm run dev   - Start development"
  '';
}
