import * as React from "react";
import SettingsItem from "./SettingsItem";

interface IProps {
    name: string;
    description: string;

    value: string;
    setValue(value: string): void;
    options: { [key: string]: string };
    errorMessage?: string;
    disabled?: boolean;
}

export default function DropDownSettingItem(props: IProps): React.JSX.Element {
    const { name, description, errorMessage } = props;

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        props.setValue(e.target.value);
    };

    return (
        <SettingsItem
            name={name}
            description={description}
            errorMessage={errorMessage}
        >
            <select
                className="dropdown"
                value={props.value}
                onChange={onChange}
                disabled={props.disabled}
            >
                {Object.entries(props.options).map(([key, value]) => (
                    <option key={key} value={key}>
                        {value}
                    </option>
                ))}
            </select>
        </SettingsItem>
    );
}
