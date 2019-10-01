Keep track of a contextStack of zones/lastActiveElements, so that
zones can be opened within zones and focus can easily be restored
(think of a hidden sidebar or modal interaction)

```js
stackContext() {
  contextStack.push({ zone, activeElement })
}
popContext() {
  context = contextStack.pop()
  focus: context.zone, context.lastActiveElement
}
clearContextStack() {
  // clear stack -- focus will return to fist focusable element if current context closes...?
}
```
