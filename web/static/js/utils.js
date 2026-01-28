// utility functions

export function clear(element) {
  while (element && element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
