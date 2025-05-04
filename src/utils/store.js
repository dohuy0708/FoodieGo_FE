
import { create } from 'zustand';

const useSessionStore = create((set) => ({
  
  restaurantId: null,

 
  setRestaurantId: (id) => set({ restaurantId: id }),
  clearRestaurantId: () => set({ restaurantId: null }),

  setCategories: (newCategories) => set((state) => {
    
    if (!Array.isArray(newCategories)) {
       console.warn("setCategories: Dữ liệu truyền vào không phải là mảng.", newCategories);
       return {}; 
    }
    return { categories: newCategories };
  }),

  clearCategories: () => set({ categories: [] }),
}));

export default useSessionStore;