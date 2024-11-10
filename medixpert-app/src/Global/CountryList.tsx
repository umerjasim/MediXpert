import { GB, IN, US } from "country-flag-icons/react/3x2";

const CountryList: any[] = [
    { 
        code: 'IN', 
        name: 'India', 
        dialCode: "+91",
        flag: <IN width="15" />,
    },
    { 
        code: 'GB', 
        name: 'United Kingdom', 
        dialCode: "+44",
        flag: <GB width="15" /> 
    },
    { 
        code: 'US', 
        name: 'United States', 
        dialCode: "+1",
        flag: <US width="15" /> 
    },
];

export default CountryList;