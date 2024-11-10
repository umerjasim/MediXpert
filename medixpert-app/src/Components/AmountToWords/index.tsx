import { t } from "i18next";
import { inject, observer } from "mobx-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import globalStore from "../../Store/globalStore";
import Constant from "../../Global/Constant";

interface AmountToWordsProps {
  amount: number | string;
}

const AmountToWords: React.FC<AmountToWordsProps> = ({ amount }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(globalStore.language);
  }, [globalStore.language]);

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  const toWords = (num: number): string => {
    if (num === 0) return t('numberWords.0');

    const units = [
      '', 
      t('numberWords._thousand'), 
      t('numberWords._lakh'), 
      t('numberWords._million'), 
      t('numberWords._billion')
    ];

    const convertThreeDigitNumber = (num: number, isLastPart: boolean): string => {
      const hundreds = Math.floor(num / 100);
      const remainder = num % 100;
      let result = '';

      if (hundreds) {
        result += `${t(`numberWords.${hundreds}`)} ${t('numberWords._hundred')} `;
      }

      if (remainder < 20) {
        result += t(`numberWords.${remainder}`);
      } else {
        const tens = Math.floor(remainder / 10) * 10;
        const ones = remainder % 10;

        if (tens) {
          result += `${t(isLastPart ? `numberWords._${tens}` : `numberWords.${tens}`)} `;
        }

        if (ones) {
          result += t(`numberWords.${ones}`);
        }
      }

      return result.trim();
    };

    const convertWholeNumber = (num: number): string => {
      let result = '';
      let place = 0;

      while (num > 0) {
        const part = num % 1000;
        if (part) {
          const partWords = convertThreeDigitNumber(part, place === 0);
          result = `${partWords} ${units[place]} ${result}`;
        }
        num = Math.floor(num / 1000);
        place++;
      }

      return result.trim();
    };

    const convertDecimal = (decimal: number): string => {
        const roundoff = Constant.roundOffs.normal
        // Step 1: Round the decimal based on the `roundoff` variable
        const decimalStr = decimal.toFixed(roundoff);
        const decimalPart = Number(decimalStr.split(".")[0]);
    
        // Step 2: Adjust length based on `roundoff` value
        let adjustedDecimal = decimalPart;
        const decimalLength = decimalStr.split(".")[1].length;
        if (decimalLength < roundoff) {
            adjustedDecimal *= Math.pow(10, roundoff - decimalLength);
        }
    
        // Step 3: Convert adjusted decimal to parts
        const decimalArray: number[] = [];
        let placeValue = 1;
        let tempDecimal = adjustedDecimal;
        
        while (tempDecimal > 0) {
            const chunk = tempDecimal % 10;
            if (chunk > 0) {
                decimalArray.unshift(chunk * placeValue);
            }
            tempDecimal = Math.floor(tempDecimal / 10);
            placeValue *= 10;
        }
    
        // Step 4: Map parts to word translations
        const paisa = decimalArray.map((decimal, index) => {
            let result = '';
    
            if (index === decimalArray.length - 1) {
                // Last number part (single-digit or smaller part)
                result += t(`numberWords.${decimal}`);
            } else {
                // Special handling for numbers greater than 20
                if (decimal >= 20) {
                    result += t(`numberWords._${decimal}`);
                } else if (decimal === 100 || decimal === 1000) {
                    // Special case for 100, 1000, etc.
                    result += `${t(`numberWords.${decimal / 100}`)} ${t('numberWords._hundred')}`;
                } else {
                    // Direct small numbers (1-20)
                    result += t(`numberWords.${decimal}`);
                }
            }
    
            return result.trim();
        }).join(' ');
    
        return decimalArray.length > 0 ? `${paisa} ${t('currencyOptions.currencyFractionPlural')}` : '';
    };
    

    const [whole, dec] = num.toString().split('.').map(Number);
    const wholePart = convertWholeNumber(whole);
    const decimalPart = dec ? ` ${t('andText')} ${convertDecimal(dec)}` : '';

    const currencyTerm = whole === 1 ? t('currencyOptions.currencySingular') : t('currencyOptions.currencyPlural');
    
    return `${wholePart} ${currencyTerm}${decimalPart}`;
  };

  return <span>{toWords(numericAmount)} {t('onlyText')}</span>;
};

export default inject('globalStore')(observer(AmountToWords));