export const API_BASE = 'http://192.168.18.84:8000/api'; // emulator. Replace with http://<your-machine-ip>:8000/api for physical device
//export const API_BASE = 'http://hr.kamghar.com/api'; // emulator. Replace with http://<your-machine-ip>:8000/api for physical device
//export const API_BASE = 'https://digitalhr.cyclonenepal.com/api'; // emulator. Replace with http://<your-machine-ip>:8000/api for physical device
export function API(path){ if(path.startsWith('/')) return API_BASE + path; return API_BASE + '/' + path; }