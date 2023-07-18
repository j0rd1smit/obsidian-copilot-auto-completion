import * as React from "react";
import SettingsItem from "./SettingsItem";
import { useRef } from "react";

interface IProps {
    name: string;
    description: string;

    setValue(value: number): void;

    errorMessage?: string;
    suffix?: string;

    value: number;
    min: number;
    max: number;
    step: number;
}

export default function SliderSettingsItem(props: IProps): React.JSX.Element {
    const { errorMessage } = props;

    const [isFocused, setIsFocused] = React.useState<boolean>(false);
    const sliderRef = useRef<HTMLInputElement>(null);

    const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = Number(e.target.value);
        if (isNaN(value)) {
            return;
        }
        value = Math.min(props.max, Math.max(props.min, value));
        props.setValue(value);
    };
    const displayValue = props.value + (props.suffix ? props.suffix : "");

    return (
        <SettingsItem
            name={props.name}
            description={props.description}
            errorMessage={errorMessage}
        >
            <input
                ref={sliderRef}
                onChange={onValueChange}
                className="slider"
                type="range"
                min={props.min}
                max={props.max}
                step={props.step}
                value={props.value}
                onMouseEnter={() => setIsFocused(true)}
                onMouseLeave={() => setIsFocused(false)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            {isFocused && sliderRef.current !== null && (
                <div
                    className="tooltip mod-top"
                    style={{
                        top: sliderRef.current.getBoundingClientRect().top - 30,
                        left:
                            sliderRef.current.getBoundingClientRect().left +
                            sliderRef.current.getBoundingClientRect().width / 2,
                    }}
                >
                    {displayValue}
                </div>
            )}
        </SettingsItem>
    );
}
