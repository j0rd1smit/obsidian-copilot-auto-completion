import * as React from "react";
import {Trigger} from "../settings";


interface IProps {
    name: string;
    description: string;
    triggers: Trigger[];

    setValues(value: Trigger[]): void;

    errorMessage?: string;
    errorMessages: Map<string, string>;
}

function TriggerSettings(props: IProps): React.JSX.Element {
    const { name, triggers, description, setValues, errorMessage } = props;
    const onClickAddButton = () => {
        setValues([{value: "TODO...", type: "string"}, ...triggers]);
    };
    const onClickRemoveButton = (index: number) => {
        return () => {
            const newTriggers = triggers
                .slice(0, index)
                .concat(triggers.slice(index + 1));
            setValues(newTriggers);
        };
    };
    const onChangeType = (index: number) => {
        return (e: React.ChangeEvent<HTMLSelectElement>) => {
            if (e.target.value === "regex" || e.target.value === "string") {
                const value = triggers[index].value;
                const newTriggers = [...triggers];
                newTriggers[index] = {type: e.target.value as Trigger["type"], value};
                setValues(newTriggers);
            }
        };
    }

    const onChangeValue = (index: number) => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const type = triggers[index].type;
            const newTriggers = [...triggers];
            newTriggers[index] = {type, value: decodeHiddenCharacters(e.target.value)};
            setValues(newTriggers);
        };
    };

    return (
        <>
            <div className="setting-item">
                <div className="setting-item-info">
                    <div className="setting-item-name">{name}</div>
                    <div className="setting-item-description">
                        {description}
                    </div>
                    {props.errorMessages.get("triggerWords") !== undefined && (
                        <div className="setting-item-description ">
                            <span className={"mod-warning"}>
                                {errorMessage}
                            </span>
                        </div>
                    )}
                </div>
                <div className="setting-item-control">
                    <div
                        className="clickable-icon setting-editor-extra-setting-button"
                        aria-label="Add"
                        onClick={onClickAddButton}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="svg-icon lucide-plus"
                        >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                </div>
            </div>

            {triggers.map((trigger: Trigger, index: number) => (
                <div
                    className="setting-list-item-copilot-auto-completion"
                    key={`setting-list-item-${name.replace(" ", "-")}-${index}`}
                >
                    {(props.errorMessages.get(`triggers.${index}.value`) !== undefined || props.errorMessages.get(`triggers.${index}.type`) !== undefined) &&  (
                                <div className="setting-item-description" style={{ width: "100%", textAlign: "left" }}>
                                    {props.errorMessages.get(`triggers.${index}.value`) !== undefined && (
                                        <span className={"mod-warning"}>
                                            {props.errorMessages.get(`triggers.${index}.value`)}
                                        </span>
                                    )}
                                    {props.errorMessages.get(`triggers.${index}.type`) !== undefined && (
                                        <span className={"mod-warning"}>
                                            {props.errorMessages.get(`triggers.${index}.type`)}
                                        </span>
                                    )}
                                </div>
                            )}
                    <div className="setting-item-info">
                        <div className="setting-item-control">
                            <select
                                className="dropdown"
                                value={trigger.type}
                                onChange={onChangeType(index)}
                            >
                                    <option value={"string"}>
                                       string
                                    </option>
                                    <option value={"regex"}>
                                       regex
                                    </option>
                            </select>
                            <input
                                style={{ whiteSpace: "pre-wrap" }}
                                type="text"
                                placeholder={"TODO..."}
                                value={encodeHiddenCharacters(trigger.value)}
                                onChange={onChangeValue(index)}
                            />

                            <div
                                className="clickable-icon setting-editor-extra-setting-button"
                                aria-label="Remove"
                                onClick={onClickRemoveButton(index)}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="svg-icon lucide-x"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

function encodeHiddenCharacters(value: string) {
    return value.replace("\t", "\\t").replace("\n", "\\n");
}

function decodeHiddenCharacters(value: string) {
    return value.replace("\\t", "\t").replace("\\n", "\n");
}

export default TriggerSettings;
