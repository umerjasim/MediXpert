import { t } from "i18next";
import React from "react";

interface MandatoryProps {
    starColor?: string;
    iconColor?: string;
    fontSize?: string;
    text?: string;
    marginTop?: number;
}

export const Mandatory: React.FC<MandatoryProps> = ({ 
    starColor = '#626262',
    iconColor = 'red',
    fontSize = '12px',
    text = t('mandatoryFieldsText'),
    marginTop = 0
}) => {
    return (
        <div style={{
            fontSize: fontSize,
            color: starColor,
            marginTop
        }}>
            <span style={{ color: iconColor }}>*</span> {text}
        </div>
    );
};
