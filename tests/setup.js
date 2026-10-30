// jsdom does not implement native dialog methods. The application uses the real
// browser methods; this adapter supplies their open/close state for UI tests.
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
}
