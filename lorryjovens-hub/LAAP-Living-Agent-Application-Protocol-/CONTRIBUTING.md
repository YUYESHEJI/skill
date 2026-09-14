# Contributing to LAAP

We love your input! We want to make contributing to LAAP as easy and transparent as possible.

## Development Process

1. Fork the repo and create your branch from `main`
2. If you've added code, add tests
3. Ensure the test suite passes
4. Make sure your code lints
5. Issue that pull request!

## Development Setup

```bash
# Clone the repo
git clone https://github.com/laap-agi/laap.git
cd laap

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate

# Install in development mode
pip install -e ".[dev,all]"

# Install pre-commit hooks
pip install pre-commit
pre-commit install
```

## Code Style

- **Python**: We use `ruff` for linting and formatting
- **Rust**: We use `rustfmt` and `clippy`
- **TypeScript**: We use `eslint` and `prettier`

Run linting before committing:

```bash
ruff check laap/ tests/
mypy laap/
```

## Testing

Write tests for any new functionality:

```bash
pytest -v
pytest --cov=laap
```

## Pull Request Process

1. 在提交 Pull Request 之前，请先阅读并同意 [CLA.md](CLA.md)。
2. 在首次 PR 中评论 `I have read and agree to the LAAP CLA.` 以完成签署。
3. Update the README.md with details of changes if needed
4. Update the CHANGELOG.md with any new features or fixes
5. The PR will be merged once you have the sign-off of maintainers

## 许可说明

本仓库采用分层许可策略，详见 [LICENSING.md](LICENSING.md)。通过提交贡献，您同意项目维护者可将您的贡献用于社区版、商业版、论文及任何衍生作品，并在不同许可层级之间切换。

When you submit code changes, your submissions are understood to be under the
layered licensing strategy described in [LICENSING.md](LICENSING.md). You must
also agree to the [CLA.md](CLA.md) before your contribution can be merged.
