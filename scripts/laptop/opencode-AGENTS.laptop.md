
## The agent browser and Slack jobs on this MacBook

- This MacBook stands in for barn. Browser tools drive ONE shared agent Chrome (its own profile,
  DevTools on 127.0.0.1:9222) through the cow-eyes bridge on 127.0.0.1:4100, each thread in its own
  tab. Callum watches or takes over from the Browser button in CowCode.
- The profile holds Callum's sign-ins. Never clear its cookies or storage, never sign out of anything
  in it, and never leave a `page.route` stub behind; do local or test auth work in a separate browser
  context. `~/.local/bin/cow-slack browser` says whether it is signed in to app.coval.dev.
- When a page needs a human (sign-in, 2FA, CAPTCHA, payment), ask Callum to finish that step in the
  Browser panel; never type his passwords or codes yourself.
- A thread whose first prompt begins "Callum mentioned you (cowcode) in a Slack thread" is a Slack
  work job; its final reply is posted for it as cowcode. Updates Callum asks for go to the thread as
  cowcode with `~/.local/bin/cow-slack say <channel> <thread_ts>` (text on stdin), never with
  `~/.slack_token`, which posts as him.
