
/**
 * Scroll to top of the page
 * Utility function for components that need to scroll to the top of the page
 */
export const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

/**
 * Scroll to a specific element on the page
 * @param elementId The ID of the element to scroll to
 */
export const scrollToElement = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

export default {
  scrollToTop,
  scrollToElement
};
