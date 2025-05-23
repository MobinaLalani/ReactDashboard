import React, { ReactNode, useState, useEffect, useRef } from "react";
import { useField, useFormikContext } from "formik";
import { FieldTheme } from "../../../models/enums/FieldTheme";
import { IDropDown } from "../../../models/viewModels/common/IDropDown";
// import { ReactComponent as ChevronDownIcon } from "../../../icons/arrow-down.svg";
// import { ReactComponent as CloseRedIcon } from "../../../icons/closeRedIcon.svg";
import Loading from "../../../components/tools/loading/Loading";
import { CloseRedIcon, ChevronDownIcon } from "../../../icons";

interface Props {
  name: string;
  placeholder?: string;
  label?: string;
  className?: string;
  innerClassName?:string;
  help?: string | ReactNode;
  icon?: ReactNode;
  onChange?: any;
  options: IDropDown[];
  value?: any;
  isMulty?: boolean;
  inputClassName?: string;
  readonly?: boolean;
  theme?: FieldTheme;
  isLoading?: boolean;
}

const AutoComplete: React.FC<Props> = ({
  innerClassName,
  onChange,
  name,
  placeholder,
  label = "",
  className = "",
  isMulty = false,
  inputClassName,
  help,
  icon,
  options,
  readonly = false,
  theme = FieldTheme.Primary,
  isLoading = false,
}) => {
  const [field, { error, touched }] = useField(name);
  const { setFieldValue } = useFormikContext();
  const [filteredOptions, setFilteredOptions] = useState<IDropDown[]>(options);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [multySelect, setMultySelect] = useState<IDropDown[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // برای حالت تک انتخابی: اگر مقدار اولیه وجود داشته باشد، برچسب گزینه انتخاب شده تنظیم شود.
  useEffect(() => {
    if (field.value && !isMulty) {
      const selectedOption = options.find((opt) => opt.value === field.value);
      if (selectedOption) {
        setSelectedLabel(selectedOption.label);
      }
    }
  }, [field.value, options, isMulty]);

  // اگر حالت چند انتخابی فعال باشد و field.value آرایه‌ای از مقادیر باشد، state انتخاب‌های چندگانه را مقداردهی اولیه می‌کنیم.
  useEffect(() => {
    if (isMulty && Array.isArray(field.value)) {
      const selectedOptions = options.filter((opt) =>
        field.value.includes(opt.value)
      );
      setMultySelect(selectedOptions);
    }
  }, [field.value, options, isMulty]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedLabel(value);
    if (value) {
      setFilteredOptions(
        options.filter((option) =>
          option.label.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setFilteredOptions(options);
    }
    setShowOptions(true);
  };

  const handleOptionSelect = (option: IDropDown) => {
    if (isMulty) {
      if (!multySelect.some((item) => item.value === option.value)) {
        const updatedSelection = [...multySelect, option];
        setMultySelect(updatedSelection);
        // مقدار فرم فقط شامل مقادیر (value) می‌شود
        setFieldValue(
          name,
          updatedSelection.map((item) => item.value)
        );
      }
    } else {
      setFieldValue(name, option.value);
      setSelectedLabel(option.label);
    }
    setShowOptions(false);
    onChange?.(option);
  };

  const handleRemove = (label: string) => {
    const updatedSelection = multySelect.filter(
      (option) => option.label !== label
    );
    setMultySelect(updatedSelection);
    setFieldValue(
      name,
      updatedSelection.map((item) => item.value)
    );
  };

  const toggleDropdown = () => {
    if (!readonly) {
      setShowOptions(true);
    }
  };

  return (
    <div className={`form-control w-full ${className}`} ref={wrapperRef}>
      {label && (
        <label className="label text-right block text-gray-900 font-semibold text-sm">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`flex items-center cursor-pointer ${innerClassName}`}
          onClick={toggleDropdown}
        >
          {icon && <div className="p-2 absolute right-4 top-2">{icon}</div>}
<input
  type="text"
  placeholder={placeholder}
  value={!isMulty ? selectedLabel || "" : ""}
  onChange={handleInputChange}
  className={`input w-full text-base text-[#6B7280] font-medium 
              rounded-[12px] h-[40px] mt-[7px] focus-within:outline-[0px]  
              ${readonly ? "hover:cursor-default border-none" : ""}
              ${theme === FieldTheme.Primary ? "bg-[#FFF]" : "bg-[#F3F4F6]"} 
              ${icon && "pr-12"}
              pr-[14px]  // 👈 اضافه‌شده برای جلو آوردن placeholder
              text-right
              ${touched && error ? "input-error" : ""} ${inputClassName}`}
/>
          {readonly === false && (
            <button
              type="button"
              className="absolute left-4 focus:outline-none"
            >
              <ChevronDownIcon />
            </button>
          )}
        </div>
      {showOptions && (
  <ul className="absolute z-10 w-full bg-white border-[1px] border-gray-200 rounded-[16px] shadow max-h-40 overflow-y-auto text-right">
    {isLoading ? (
      <div className="flex justify-center items-center py-2">
        <Loading />
      </div>
    ) : filteredOptions?.length > 0 ? (
      filteredOptions.map((option) => (
        <li
          key={option.value}
          className="px-4 py-2 font-semibold text-sm cursor-pointer hover:bg-gray-100"
          onClick={() => handleOptionSelect(option)}
        >
          {option.label}
        </li>
      ))
    ) : (
      <li className="px-4 py-2 font-semibold text-sm text-gray-500">
        داده‌ای موجود نیست
      </li>
    )}
  </ul>
)}

        {isMulty && (
          <div className="flex flex-wrap gap-[8px] mt-2">
            {multySelect.map((value) => (
              <div
                key={value.value}
                className="border-2 max-w-fit rounded-lg border-[#FF7959] bg-[#FF7F7E10] flex items-center text-[#FF7959] text-[12px] font-bold py-1 px-3 gap-1"
              >
                {value.label}
                {!readonly && (
                  <CloseRedIcon
                    className="cursor-pointer"
                    onClick={() => handleRemove(value.label)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {touched && error ? (
        <p className="text-error text-sm mt-1">{error}</p>
      ) : (
        help && <p className="text-gray-500 text-sm mt-1">{help}</p>
      )}
    </div>
  );
};

export default AutoComplete;
