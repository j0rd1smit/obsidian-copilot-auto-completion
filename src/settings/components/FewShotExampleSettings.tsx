import * as React from "react";


import Context from "../../context_detection";
import { Notice } from "obsidian";
import {FewShotExample} from "../settings";

interface IProps {
    name: string;
    description: string;

    errorMessages: Map<string, string>;

    fewShotExamples: FewShotExample[];
    setFewShotExamples(fewShotExamples: FewShotExample[]): void;
}

export default function FewShotExampleSettings(
    props: IProps
): React.JSX.Element {
    const onClickRemoveButton = (index: number) => {
        return () => {
            const newFewShotExamples = props.fewShotExamples
                .slice(0, index)
                .concat(props.fewShotExamples.slice(index + 1));

            props.setFewShotExamples(newFewShotExamples);
        };
    };
    const onClickAddButton = () => {
        const newFewShotExamples = [
            {
                context: Context.Text,
                input: "TODO",
                answer: "Thought: TODO\nAnswer: TODO",
            },
            ...props.fewShotExamples,
        ];
        props.setFewShotExamples(newFewShotExamples);
    };

    const onChangeContext = (index: number) => {
        return (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newFewShotExamples = [...props.fewShotExamples];
            const context = Context.get(e.target.value);
            if (context === undefined) {
                new Notice("Invalid context");
                return;
            }
            newFewShotExamples[index] = {
                ...newFewShotExamples[index],
                context,
            };

            props.setFewShotExamples(newFewShotExamples);
        };
    };

    const onChangeInput = (index: number) => {
        return (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newFewShotExamples = [...props.fewShotExamples];
            newFewShotExamples[index] = {
                ...newFewShotExamples[index],
                input: e.target.value,
            };
            props.setFewShotExamples(newFewShotExamples);
        };
    };

    const onAnswerInput = (index: number) => {
        return (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newFewShotExamples = [...props.fewShotExamples];
            newFewShotExamples[index] = {
                ...newFewShotExamples[index],
                answer: e.target.value,
            };
            props.setFewShotExamples(newFewShotExamples);
        };
    };

    return (
        <div>
            <div className="setting-item" style={{ display: "flex" }}>
                <div className="setting-item-info">
                    <div className="setting-item-name">{props.name}</div>

                    <div className="setting-item-description">
                        {props.description}
                    </div>
                    {props.errorMessages.get("fewShotExamples") !== undefined &&  (
                        <div className="setting-item-description ">
                            <span className={"mod-warning"}>
                                {props.errorMessages.get("fewShotExamples")}
                            </span>
                        </div>
                    )}
                </div>
                <div style={{ top: 0, right: 0 }}>
                    <span
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
                    </span>
                </div>
            </div>
            {props.fewShotExamples.map((example, index) => (
                <div
                    key={`few-shot-example-${index}`}
                    style={{
                        borderBottom:
                            "1px solid var(--background-modifier-border)",
                    }}
                >
                    <div className="setting-item" style={{ display: "flex" }}>
                        <div className="setting-item-info">
                            <div className="setting-item-name">
                                Example {index + 1}
                            </div>
                        </div>
                        <div style={{ top: 0, right: 0 }}>
                            <span
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
                            </span>
                        </div>
                    </div>
                    <div
                        className="setting-item"
                        style={{ display: "block", borderTop: 0 }}
                    >
                        <div className="setting-item-control">
                            <div
                                className="setting-item-name"
                                style={{ textAlign: "left", width: "100%" }}
                            >
                                Context
                            </div>
                            <select
                                className="dropdown"
                                value={example.context}
                                onChange={onChangeContext(index)}
                            >
                                {Context.values().map((key) => (
                                    <option key={key} value={key}>
                                        {key}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div
                            className="setting-item-control"
                            style={{ display: "block" }}
                        >
                            <div
                                className="setting-item-name"
                                style={{ width: "100%", textAlign: "left" }}
                            >
                                Human Message
                            </div>
                            {props.errorMessages.get(`fewShotExamples.${index}.input`) !== undefined &&  (
                                <div className="setting-item-description" style={{ width: "100%", textAlign: "left" }}>
                                    <span className={"mod-warning"}>
                                        {props.errorMessages.get(`fewShotExamples.${index}.input`)}
                                    </span>
                                </div>
                            )}
                            <textarea
                                className="setting-item-text-area-copilot-auto-completion"
                                rows={5}
                                style={{ width: "100%" }}
                                value={example.input}
                                onChange={onChangeInput(index)}
                            />
                            <div
                                className="setting-item-name"
                                style={{ width: "100%", textAlign: "left" }}
                            >
                                Assistant Message
                            </div>
                            {props.errorMessages.get(`fewShotExamples.${index}.answer`) !== undefined &&  (
                                <div className="setting-item-description" style={{ width: "100%", textAlign: "left" }}>
                                    <span className={"mod-warning"}>
                                        {props.errorMessages.get(`fewShotExamples.${index}.answer`)}
                                    </span>
                                </div>
                            )}
                            <textarea
                                className="setting-item-text-area-copilot-auto-completion"
                                rows={5}
                                style={{ width: "100%" }}
                                value={example.answer}
                                onChange={onAnswerInput(index)}
                            />

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
