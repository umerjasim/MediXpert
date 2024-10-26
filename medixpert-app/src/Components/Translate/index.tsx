import React, { useState } from "react";
import { Select } from "antd";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { GB, IN } from 'country-flag-icons/react/3x2';
import Constant from "../../Global/Constant";
import { inject, observer } from "mobx-react";
import globalStore from "../../Store/globalStore";

const languageOptions = Constant.languageList;

function Translate() {
    const defaultLang = localStorage.getItem('mx-language') || 'en';

    const { i18n } = useTranslation();

    const [lang, setLang] = useState(defaultLang);

    const handleLanguageChange = (value: string) => {
        globalStore.setLanguage(value);
        setLang(value);
        i18n.changeLanguage(value);
        console.log(i18n.language)
        localStorage.setItem("mx-language", value);
    };

    return (
        <Select
        defaultValue={lang}
        style={{ 
            width: 130,
        }}
        onChange={handleLanguageChange}
        getPopupContainer={(trigger) => trigger.parentNode}
        >
            {languageOptions.map((option: any) => (
                <Select.Option key={option.key} value={option.value}>
                    {option.label}
                </Select.Option>
            ))}
        </Select>
    );
}
export default inject('globalStore')(observer(Translate));