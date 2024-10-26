import moment from 'moment';
import Constant from './Constant';
import type { RcFile } from 'antd/es/upload/interface';
import Notification from './Notification';
import i18n from '../i18n';

class Utility {
  parseJwt(token: string) {
    try {
      if (token) {
        const base64Url = token?.split('.')[1];
        const base64 = base64Url?.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split('')
            .map((c) => {
              const base = `00${c.charCodeAt(0).toString(16)}`;
              return `%${base.slice(-2)}`;
            })
            .join(''),
        );
        return JSON.parse(jsonPayload);
      }
      return null;
    } catch (err: any) {
      return null;
    }
  }

  getRefreshTokenTime = () => {
    if (localStorage?.refreshToken) {
      const refreshToken = this.parseJwt(localStorage?.refreshToken);
      return refreshToken?.expiryTime;
    }
    return null;
  };

  trimSpacesInValues(value: string) {
    if (value !== undefined && value !== null) {
      return value?.trimStart()?.replace(/( )\1+/g, '$1');
    }
    return '';
  }

  trimEndSpacesInValues(value: string) {
    if (value !== undefined || value !== null) {
      return value?.trimStart()?.replace(/( )\1$/g, '$1');
    }
    return '';
  }

  getFormattedDateToDB = (date: Date | number) => {
    if (date) {
      return moment(date).format(Constant.dateFormatToDB);
    }
    return null;
  };

  getFormattedStartDateToDB = (date: Date | number) => {
    if (date) {
      return moment(date)?.startOf('month')?.format(Constant.dateFormatToDB);
    }
    return null;
  };

  getFormattedDateFromDB = (date: Date | number | string) => {
    if (date) {
      return moment(date).format(Constant.dateFormat);
    }
    return '';
  };

  getByValue = (map: any, searchValue: string) => {
    for (const [key, value] of map.entries()) {
      if (value === searchValue)
        return key.toString();
    }
  }

  getFormattedDateTimeFromDB = (date: Date | number | string) => {
    if (date) {
      return moment(date).format(Constant.dateTimeFormat);
    }
    return '';
  };

  calculateDateDifference = (startDate: Date | number, endDate: Date | number) => moment(endDate).diff(moment(startDate), 'days');

  disabledFutureDates = (current: moment.Moment): boolean => current && current > moment();

  disabledPastDates = (current: moment.Moment): boolean => current && current < moment();

  getMimetype = (signature: any) => {
    if (signature?.startsWith('424D')) return 'image/bmp'

    switch (signature) {
      case '89504E47':
        return 'image/png';
      case '47494638':
        return 'image/gif';
      case '25504446':
      case 'DFBF34EB':
        return 'application/pdf';
      case '504B34':
      case '504B0304':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'D0CF11E0':
        return 'application/msword';
      case 'FFD8FFDB':
      case 'FFD8FFE0':
      case 'FFD8FFE1':
      case 'FFD8FFE2':
      case 'FFD8FFE3':
      case 'FFD8FFE8':
        return 'image/jpeg';
      case '4944334':
      case '4944333':
        return 'audio/mpeg';
      case '00020':
      case '00018':
      case '0001C':
      case '66747970':
        return 'video/mp4';
      default:
        return 'Unknown filetype';
    }
  };

  validateFile = async (file: any): Promise<boolean> => new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result: any = e?.target?.result;
      const uint = new Uint8Array(result);
      const bytes: any[] = [];
      uint.forEach((byte) => {
        bytes.push(byte.toString(16));
      });
      const hex = bytes.join('').toUpperCase();
      const mimeType = this.getMimetype(hex);
      if (file.type === mimeType || mimeType.split(',').includes(file.type)) {
        resolve(true);
      } else { resolve(false); }
    };
    reader.onerror = () => resolve(false);
    const blob = file.slice(0, 4);
    reader.readAsArrayBuffer(blob);
  });

  DataURIToBlob = async (dataURI: string, fileName: string) => {
    const splitDataURI = dataURI.split(',');
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? window.atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
    const myBlob = new Blob([ia], { type: mimeString });
    return new File([myBlob], fileName, { type: mimeString })
  };

  truncate = (str: string, length = 100) => (str.length > length ? `${str.substring(0, length)}...` : str);

  backToTop = (divName: string) => {
    const textAreaID: any = document.getElementById(divName);
    textAreaID.scrollTop = 0;
  };

  removeSpecialCharacter = (stringToReplace: string, replaceString = '-') => {
    return stringToReplace.replace(/[^\w\s.]/gi, replaceString);
  }

  removeExtension = (filename: string) => {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
  }

  getFileName = (inspectionStore: any) => {
    const ApproveFileName = `${inspectionStore?.generalInspection?.plantName}-MEC-${inspectionStore?.generalInspection?.tagNumber}-${inspectionStore?.generalInspection?.year}-${('0' + inspectionStore?.generalInspection?.month).slice(-2)}-${inspectionStore?.generalInspection?.occasionCode}`
    return this.removeSpecialCharacter(ApproveFileName)
  }

  checkIfLastPage = (total: number, pageSize: number, page: number) => total - pageSize * page == 0 && page > 0

  getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

    getTimeInMinutes = (time: number) => {
      const seconds = Math.ceil(time / 1000);
      return Math.round(seconds / 60);
    };
  

  calculateTimeOut = (timeOut: any) => {
    const currentDate: any = new Date();
    const futureDateFromServer: any = new Date(timeOut);

    // Get the timezone offset in minutes
    // const timezoneOffset: any = currentDate.getTimezoneOffset();
    // Adjust the future date by the timezone offset
    // futureDateFromServer.setMinutes(futureDateFromServer.getMinutes() - timezoneOffset);

    // Calculate the difference in milliseconds
    return futureDateFromServer - currentDate;
  }
  getTooltipTitle = (summaryComments:any) => {
    return !summaryComments ? i18n.t('addToHighlight') : i18n.t('removeFromHighlight');
  };
  
  handleNotificationError = (error:any) => {
    if (error && error?.errorFields && error?.errorFields.length) {
      Notification.error({
        message: i18n.t('error'),
        description: error.errorFields[0].errors[0],
      });
    } else {
      Notification.error({
        message: i18n.t('error'),
        description: error.response.data.error || i18n.t('defaultErrorMessage'),
      });
    }
  };

  formatDateToMonthYear = (data: any) => {
    if (!data) return ''; // Return empty string if data is falsy

    const date = new Date(data);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = String(date.getUTCFullYear()).slice(-2);

    return `${month}-'${year}`;
  }

  getValueOrInfinity = (val: any) => {
    if (!val || Number.isNaN(parseFloat(val))) { return Infinity; }
    return parseFloat(val);
  }

  handleEnterKey = (event: React.KeyboardEvent, formId: string, isSwitch: boolean = false) => {
    if (!formId || !event) return;

    const form = document.getElementById(formId);
    if (!form) return;

    const focusableElements = Array.from(
      form.querySelectorAll(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement
    );

    // For Ctrl + Enter, move to the previous element
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      if (currentIndex > 0) {
        focusableElements[currentIndex - 1].focus();
      }
      return;
    }

    // For Shift + Enter, handle specific element behaviors
    if (event.shiftKey && event.key === 'Enter') {
      const targetElement = focusableElements[currentIndex] as HTMLInputElement;
      
      if (targetElement && targetElement.type === 'textarea') {
        return; // Let default browser behavior happen for textarea
      }

      event.preventDefault();

      if (targetElement) {
        // Handle behavior for checkboxes, radios, select, and switch
        if (targetElement.type === 'checkbox' || targetElement.type === 'radio') {
          targetElement.checked = !targetElement.checked;
        } else if (targetElement.tagName.toLowerCase() === 'select') {
          const selectElement = targetElement as unknown as HTMLSelectElement;
          if (selectElement.options.length > 0) {
            // Toggle between options in the select
            selectElement.selectedIndex = (selectElement.selectedIndex + 1) % selectElement.options.length;
          }
        } else if (targetElement.hasAttribute('role') && targetElement.getAttribute('role') === 'switch') {
          // Check if it's a switch
          const switchElement = targetElement as HTMLElement;
    
          // Toggle the class
          if (switchElement.classList.contains('ant-switch-checked')) {
            switchElement.classList.remove('ant-switch-checked');
          } else {
            switchElement.classList.add('ant-switch-checked');
          }
        }
      }
      return;
    }

    // For regular Enter, move to the next element
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus();
      } else if (currentIndex === focusableElements.length - 1) {
        focusableElements[currentIndex].click();
      }
    }
  };

  handleFocus = (id: string) => {

    const targetElement = document.getElementById(id);
  
    if (targetElement) {
      targetElement.focus();
    }
  };

  getEmptyKeys = (mandatoryFieldData: Record<string, any>): string[] => {
    return Object.keys(mandatoryFieldData).filter(key => !mandatoryFieldData[key]);
  };

  roundTo(value: number, round: number) {
    const roundedValue = round === 0 ? Math.round(value) : Number(value.toFixed(round));
    const decimalPlaces = value.toString().split('.')[1]?.length || 0;
    const roundoffValue = +(roundedValue - value).toFixed(decimalPlaces);

    return {
        roundedValue,
        roundoffValue
    };
  }

}

export default new Utility();
