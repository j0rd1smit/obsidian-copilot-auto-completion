
# Git sha hash checksums
Every snapshot in git is check summed before it is stored using an SHA-1. This produces a 40-char string with hexadecimal chars (0-9 & a-f). 


This hash is based on the following information:

- The source tree of the commit (content of all the files in the repo and their locations).
- The parent commit sha1
- The author info
- The committer info (right, those are different!)
- The commit message