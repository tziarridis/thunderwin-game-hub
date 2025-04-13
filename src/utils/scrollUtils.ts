
/**
 * Utility functions for scroll behavior
 */

/**
 * Scrolls to the top of the page
 */
export const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

/**
 * Scrolls to a specific element by ID
 * @param elementId The ID of the element to scroll to
 * @param offset Optional offset from the top of the element (in pixels)
 */
export const scrollToElement = (elementId: string, offset: number = 0): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    });
  }
};

/**
 * Handles smooth scroll behavior for anchor links
 * @param event The click event
 * @param targetId The target element ID
 */
export const handleSmoothScroll = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string): void => {
  event.preventDefault();
  scrollToElement(targetId);
};
