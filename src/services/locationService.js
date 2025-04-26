const GHN_API_TOKEN = "0afc302d-1f4e-11f0-b446-0e2d8ef3bb95";
const GHN_BASE_URL =
  'https://online-gateway.ghn.vn/shiip/public-api/master-data';

export const getProvinces = async () => {
  const url = `${GHN_BASE_URL}/province`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        token: GHN_API_TOKEN,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      let errorDetails = `HTTP error! Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetails += ` - Message: ${
          errorData.message || JSON.stringify(errorData)
        }`;
      } catch (parseError) {
        errorDetails += ` - ${response.statusText}`;
      }
      console.error("Error fetching GHN provinces:", errorDetails);

      throw new Error(errorDetails);
    }

    const result = await response.json();
   

    if (result && result.code === 200 && Array.isArray(result.data)) {
     
      return result.data;
    } else {
      console.warn(
        "Unexpected response structure from GHN province API:",
        result
      );

      return [];
    }
  } catch (error) {
    if (error.message.startsWith("HTTP error!")) {
    } else {
      console.error(
        "Network or processing error fetching GHN provinces:",
        error
      );
    }

    return [];
  }
};


export const getDistricts = async (provinceId) => {
  
  if (!provinceId) {
      console.error("getDistricts requires a provinceId.");
      return []; 
  }

 
  const url = `${GHN_BASE_URL}/district?province_id=${provinceId}`;
  console.log(`Fetching districts for provinceId: ${provinceId} from GHN...`);

  try {
      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'token': GHN_API_TOKEN,
              'Accept': 'application/json'
              
          },
          
      });

      if (!response.ok) {
          let errorDetails = `HTTP error! Status: ${response.status}`;
          try {
              const errorData = await response.json();
              
              errorDetails += ` - Message: ${errorData.code_message_value || errorData.message || JSON.stringify(errorData)}`;
          } catch (parseError) {
              errorDetails += ` - ${response.statusText}`;
          }
          console.error('Error fetching GHN districts:', errorDetails);
         
          throw new Error(errorDetails); 
      }

      const result = await response.json();
     

      
      if (result && result.code === 200 && Array.isArray(result.data)) {
         
         
          return result.data;
      } else {
        
           console.warn(`Unexpected successful response structure from GHN district API for province ${provinceId}:`, result);
          
          return []; 
      }

  } catch (error) {
     
      if (!error.message.startsWith('HTTP error!')) {
          console.error(`Network or processing error fetching GHN districts for province ${provinceId}:`, error);
      }
     
      return []; 
  }
};

export const getWards = async (districtId) => {
  
  if (!districtId) {
      console.error("getDistricts requires a provinceId.");
      return []; 
  }

 
  const url = `${GHN_BASE_URL}/ward?district_id=${districtId}`;


  try {
      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'token': GHN_API_TOKEN,
              'Accept': 'application/json'
              
          },
          
      });

      if (!response.ok) {
          let errorDetails = `HTTP error! Status: ${response.status}`;
          try {
              const errorData = await response.json();
              
              errorDetails += ` - Message: ${errorData.code_message_value || errorData.message || JSON.stringify(errorData)}`;
          } catch (parseError) {
              errorDetails += ` - ${response.statusText}`;
          }
          console.error('Error fetching GHN districts:', errorDetails);
         
          throw new Error(errorDetails); 
      }

      const result = await response.json();
     

      
      if (result && result.code === 200 && Array.isArray(result.data)) {
          
         
          return result.data;
      } else {
        
           console.warn(`Unexpected successful response structure from GHN :`, result);
          
          return []; 
      }

  } catch (error) {
     
      if (!error.message.startsWith('HTTP error!')) {
          console.error(`Network or processing error fetching GHN :`, error);
      }
     
      return []; 
  }
};
