// src/composables/useMenuAdmin.js
import { ref, reactive } from 'vue';
//import multiProjectDAL from '@/dal/multiProjectDal';
import useNotify from '@/composables/useNotify';

export default function useMenuAdmin() {
  const notify = useNotify();
  
  // Reactive state
  const menuItems = ref([]);
  const loading = ref(false);
  const saving = ref(false);
  
  // Form state
  const formData = reactive({
    id: null,
    title: '',
    route: '',
    icon: '',
    order: null
  });

  // Validation state
  const errors = reactive({
    title: '',
    route: '',
    icon: '',
    order: ''
  });

  /**
   * Load all menu items from the appMenu collection
   */
  const loadMenuItems = async () => {
    loading.value = true;
    try {
      await multiProjectDAL.switchToProject('operational');
      const items = await multiProjectDAL.getAllItems('appMenu');
      menuItems.value = items.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error loading menu items:', error);
      notify.error('Failed to load menu items');
    } finally {
      loading.value = false;
    }
  };

  /**
   * Clear form data and errors
   */
  const clearForm = () => {
    formData.id = null;
    formData.title = '';
    formData.route = '';
    formData.icon = '';
    formData.order = null;
    clearErrors();
  };

  /**
   * Clear validation errors
   */
  const clearErrors = () => {
    errors.title = '';
    errors.route = '';
    errors.icon = '';
    errors.order = '';
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    clearErrors();
    let isValid = true;

    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }

    // Route validation
    if (!formData.route.trim()) {
      errors.route = 'Route is required';
      isValid = false;
    } else if (!formData.route.startsWith('/')) {
      errors.route = 'Route must start with "/"';
      isValid = false;
    }

    // Icon validation
    if (!formData.icon.trim()) {
      errors.icon = 'Icon is required';
      isValid = false;
    } else if (!formData.icon.startsWith('mdi-')) {
      errors.icon = 'Icon must be a Material Design Icon (start with "mdi-")';
      isValid = false;
    }

    // Order validation
    if (formData.order === null || formData.order === '') {
      errors.order = 'Order is required';
      isValid = false;
    } else if (!Number.isInteger(Number(formData.order))) {
      errors.order = 'Order must be a whole number';
      isValid = false;
    }

    return isValid;
  };

  /**
   * Create a new menu item
   */
  const createMenuItem = async () => {
    if (!validateForm()) return false;

    saving.value = true;
    try {
      await multiProjectDAL.switchToProject('operational');
      const newItem = {
        title: formData.title.trim(),
        route: formData.route.trim(),
        icon: formData.icon.trim(),
        order: Number(formData.order)
      };
      
      const id = await multiProjectDAL.addItem('appMenu', newItem);
      notify.success('Menu item created successfully');
      await loadMenuItems();
      clearForm();
      return true;
    } catch (error) {
      console.error('Error creating menu item:', error);
      notify.error('Failed to create menu item');
      return false;
    } finally {
      saving.value = false;
    }
  };

  /**
   * Update an existing menu item
   */
  const updateMenuItem = async () => {
    if (!validateForm() || !formData.id) return false;

    saving.value = true;
    try {
      await multiProjectDAL.switchToProject('operational');
      const updateData = {
        title: formData.title.trim(),
        route: formData.route.trim(),
        icon: formData.icon.trim(),
        order: Number(formData.order)
      };
      
      await multiProjectDAL.updateItem('appMenu', formData.id, updateData);
      notify.success('Menu item updated successfully');
      await loadMenuItems();
      clearForm();
      return true;
    } catch (error) {
      console.error('Error updating menu item:', error);
      notify.error('Failed to update menu item');
      return false;
    } finally {
      saving.value = false;
    }
  };

  /**
   * Delete a menu item
   */
  const deleteMenuItem = async (id) => {
    if (!id) return false;

    try {
      await multiProjectDAL.switchToProject('operational');
      await multiProjectDAL.deleteDocument('appMenu', id);
      notify.success('Menu item deleted successfully');
      await loadMenuItems();
      return true;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      notify.error('Failed to delete menu item');
      return false;
    }
  };

  /**
   * Load data into form for editing
   */
  const loadItemForEdit = (item) => {
    formData.id = item.id;
    formData.title = item.title;
    formData.route = item.route;
    formData.icon = item.icon;
    formData.order = item.order;
    clearErrors();
  };

  return {
    // State
    menuItems,
    loading,
    saving,
    formData,
    errors,
    
    // Methods
    loadMenuItems,
    clearForm,
    clearErrors,
    validateForm,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    loadItemForEdit
  };
}