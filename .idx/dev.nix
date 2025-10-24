{ pkgs, ... }:

{
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages.
  packages = [
    pkgs.nodejs_20
  ];

  # Sets environment variables in the workspace.
  env = {};

  # Services to make available in the preview.
  services.mongodb.enable = true;

  # Options for setting up your workspace.
  # Check https://devenv.sh/basics/options/ for all options.
  un  = {};

  # Settings for the browser extension.
  # Check https://devenv.sh/guides/browser-extension/ for all options.
  extensions = {};
}
