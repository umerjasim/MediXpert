import { t } from "i18next";
import React from "react";

interface MandatoryProps {
    starColor?: string;
    iconColor?: string;
    fontSize?: string;
    text?: string;
}

export const Mandatory: React.FC<MandatoryProps> = ({ 
    starColor = '#626262',
    iconColor = 'red',
    fontSize = '12px',
    text = t('mandatoryFieldsText')
}) => {
    return (
        <div style={{
            fontSize: fontSize,
            color: starColor,
        }}>
            <span style={{ color: iconColor }}>*</span> {text}
        </div>
    );
};
