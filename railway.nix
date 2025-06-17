{ pkgs }: {
  deps = [
    pkgs.nodejs
    pkgs.python3
    pkgs.python3Packages.pillow
    pkgs.python3Packages.requests
  ];
}
