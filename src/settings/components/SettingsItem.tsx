import * as React from "react";

interface IProps {
    name: string;
    description: string;
    errorMessage?: string;
    children: React.ReactNode;
    display?: "block" | "inline-block" | "flex";
}

export default function SettingsItem({
    name,
    description,
    children,
    errorMessage,
    display = "flex",
}: IProps): React.JSX.Element {
    return (
        <div className="setting-item" style={{ display: display }}>
            <div className="setting-item-info">
                <div className="setting-item-name">{name}</div>

                <div className="setting-item-description">{description}</div>
                {errorMessage !== undefined && (
                    <div className="setting-item-description ">
                        <span className={"mod-warning"}>{errorMessage}</span>
                    </div>
                )}
            </div>

            <div className="setting-item-control">{children}</div>
        </div>
    );
}
