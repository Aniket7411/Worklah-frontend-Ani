# Remove .env from git cache
git rm --cached .env

# Add updated .gitignore
git add .gitignore

# Amend the commit to remove .env
git commit --amend --no-edit


