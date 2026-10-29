import fs from 'fs';
 


export const hospital = [];



fs.readFile("hospital.json" , (error,data) => {
    if (error) {
      console.error(error);

      throw error;
    }
    hospital = JSON.parse(data)

    console.log(hospital);
  }) 