defmodule Agid.MixProject do
  use Mix.Project

  def project do
    [
      app: :agid,
      version: "0.1.0",
      elixir: "~> 1.15",
      description: "AGID Elixir SDK",
      package: [licenses: ["MIT"]]
    ]
  end
end
