# shell.nix
{ pkgs ? import <nixpkgs> {} }:
let
  my-python = pkgs.python312;
  python-with-my-packages = my-python.withPackages (p: with p; [
    pelican
    markdown
    jinja2
    # other python packages you want
  ]);
in
pkgs.mkShell {
  name = "python";

  buildInputs = [
    python-with-my-packages
  ];
  shellHook = ''
    PYTHONPATH=${python-with-my-packages}/${python-with-my-packages.sitePackages}
  '';
}
