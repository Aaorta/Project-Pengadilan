const searchStringObj = <T extends { [k: string]: any }>(obj: T, searchKey: string) => {
     if (!obj) return false
     return Object.keys(obj).some(function(key){
          if (Array.isArray(obj[key])) {
               const again = searchStringNested(obj[key], searchKey)
               if(again.length) return true
               return false
          }

          if (typeof obj[key] === "object") {
               const again = searchStringObj(obj[key], searchKey)
               if (again) return true
               return false
          }

          if (!["string", "number",  "boolean"].includes(typeof obj[key])) 
               return false
          return String(obj[key])?.toLowerCase()?.includes(searchKey?.toLowerCase());
     })
}

export function searchStringNested<T extends { [k: string]: any }>(arr: T[], searchKey: string) {
     if (typeof arr !== "object") return [];
     return arr.filter(function(obj) {
          return searchStringObj(obj, searchKey)
     });
}