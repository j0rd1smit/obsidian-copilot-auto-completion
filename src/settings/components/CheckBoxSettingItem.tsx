import * as React from "react";
import SettingsItem from "./SettingsItem";

interface IProps {
    name: string;
    description: string;

    setEnabled(value: boolean): void;
    enabled: boolean;
}

export default function CheckBoxSettingItem(props: IProps): React.JSX.Element {
    const { enabled, setEnabled, name, description } = props;

    const checkContainerClasses = ["checkbox-container"];
    if (enabled) {
        checkContainerClasses.push("is-enabled");
    }

    const onClick = () => {
        setEnabled(!enabled);
    };

    return (
        <SettingsItem name={name} description={description}>
            <div onClick={onClick} className={checkContainerClasses.join(" ")}>
                <input type="checkbox" tabIndex={0} />
            </div>
        </SettingsItem>
    );
}
