import * as React from "react";
import SettingsItem from "./SettingsItem";

interface IProps {
    name: string;
    description: string;
    placeholder: string;

    setValue(value: string): void;

    errorMessage?: string;

    value: string;
    password?: boolean;
    disabled?: boolean;
}

export default function TextSettingItem(props: IProps): React.JSX.Element {
    const {
        value,
        setValue,
        password,
        placeholder,
        name,
        description,
        errorMessage,
    } = props;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
    };

    return (
        <SettingsItem
            name={name}
            description={description}
            errorMessage={errorMessage}
        >
            <input
                type={password ? "password" : "text"}
                placeholder={placeholder}
                onChange={onChange}
                value={value}
                disabled={props.disabled}
            />
        </SettingsItem>
    );
}
