// src/composables/useNotify.js

import { useToast } from "vue-toastification";

export default function useNotify() {
  // Get the toast interface provided by the plugin
  const toast = useToast();

  /**
   * Shows a success toast notification.
   * @param {string} message - The main message content.
   * @param {object} [options] - Optional vue-toastification options to override defaults.
   */
  const success = (message, options = {}) => {
    toast.success(message, options);
  };

  /**
   * Shows an error toast notification.
   * @param {string} message - The main message content.
   * @param {object} [options] - Optional vue-toastification options to override defaults.
   */
  const error = (message, options = {}) => {
    // Default options for errors: permanent until dismissed
    toast.error(message, { ...options, timeout: false });
  };

  /**
   * Shows an info toast notification.
   * @param {string} message - The main message content.
   * @param {object} [options] - Optional vue-toastification options to override defaults.
   */
  const info = (message, options = {}) => {
    toast.info(message, options);
  };

  /**
   * Shows a warning toast notification.
   * @param {string} message - The main message content.
   * @param {object} [options] - Optional vue-toastification options to override defaults.
   */
  const warning = (message, options = {}) => {
    toast.warning(message, options);
  };

  /**
   * Shows a toast with a custom Vue component as content.
   * @param {object | Function} component - The Vue component definition (imported or async).
   * @param {object} [componentProps] - Props to pass to the custom component.
   * @param {object} [options] - Optional vue-toastification options.
   */
  const component = (vueComponent, componentProps = {}, options = {}) => {
    const content = {
      component: vueComponent,
      props: componentProps,
    };
    toast(content, options);
  };

  /**
   * Clears all currently displayed toasts.
   */
  const clearAll = () => {
    toast.clear();
  };

  return {
    success,
    error,
    info,
    warning,
    component,
    clearAll,
  };
}