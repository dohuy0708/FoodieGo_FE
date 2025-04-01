export const getProvinces = async () => {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  };
  
  export const getDistrictsByProvinceCode = async (provinceCode) => {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await response.json();
      return data.districts;
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  };
  
  export const getWardsByDistrictCode = async (districtCode) => {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await response.json();
      return data.wards;
    } catch (error) {
      console.error('Error fetching wards:', error);
      return [];
    }
  };