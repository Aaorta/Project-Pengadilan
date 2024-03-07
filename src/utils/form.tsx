import { HTMLInputTypeAttribute, useRef, useState } from "react"
import { Box, Space, Tabs, Title, Button, TextInput, Text, Select, Textarea } from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { DatePickerInput, TimeInput } from "@mantine/dates";

export type FormSelectData = {
    name: string,
    label: string
}

export type FormType = {
    type: "text" | "textarea" | "select" | "datetime" | "time"
    key: string,
    
    selectData?: FormSelectData[],
    selectDataUrl?: string,

    childFormOnCondition?: { [k: string]: FormType[] },

    initialValue?: any,
    initialValueKey?: string,
}

const TextArea = (props: { name: string }) => {
    const [value, setValue] = useState("")
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link,
        ],
        onUpdate:({ editor }) => {
            setValue(editor.getHTML())
        }
    });
    
    return (
        <Box>
            <input hidden type="text" name={props.name} value={value} />
            <Text >{props.name}:</Text>
            <RichTextEditor editor={editor}>
                <RichTextEditor.Toolbar sticky stickyOffset={60}>
                    <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                    <RichTextEditor.Highlight />
                    <RichTextEditor.Code />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.H3 />
                    <RichTextEditor.H4 />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Blockquote />
                    <RichTextEditor.Hr />
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                    <RichTextEditor.Subscript />
                    <RichTextEditor.Superscript />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Link />
                    <RichTextEditor.Unlink />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                    <RichTextEditor.AlignLeft />
                    <RichTextEditor.AlignCenter />
                    <RichTextEditor.AlignJustify />
                    <RichTextEditor.AlignRight />
                    </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>

                <RichTextEditor.Content />
            </RichTextEditor>
        </Box>
    )
}

export const RenderForm = (props: { form: FormType }) => {
    const {
        form
    } = props
    const [additionalForm, setAdditionalForm] = useState<JSX.Element[]>([])

    // @ts-ignore
    const a: { [k: string]: JSX.Element } =  {
        "text": (
            <TextInput 
                autoComplete='off' 
                name={form.key} 
                label={form.key} 
                placeholder={form.key} 
                type={form.type} 
                defaultValue={props.form.initialValue}
            />
        ),
        "textarea": (
            // <TextArea name={form.key} />
            <Textarea 
                autoComplete='off' 
                name={form.key} 
                label={form.key} 
                placeholder={form.key} 
                defaultValue={props.form.initialValue}
                minRows={8}
                autosize
            />
        ),
        "select": form.selectData ? (
            <Select
                withinPortal 
                autoComplete='off' 
                name={form.key} 
                label={form.key} 
                placeholder={form.key} 
                data={form.selectData.map((v) => ({
                    label: v.label,
                    value: v.name
                }))}
                onChange={(value) => {
                    if(value && form.childFormOnCondition?.[value]) {
                        const temp = []
                        for (const i in form.childFormOnCondition?.[value]) {
                            const val = form.childFormOnCondition?.[value][i]
                            temp.push(<><Space h="md" /><RenderForm key={i} form={val} /></>)
                        }
                        setAdditionalForm(temp)
                    }
                }}
                defaultValue={props.form.initialValue}
            />
        ) : <></>,
        "datetime": (
            <DatePickerInput
                label={form.key}
                placeholder={form.key}
                name={form.key}
                // defaultValue={props.form.initialValue}
            />
        ),
        "time": (
            <TimeInput
                label={form.key}
                placeholder={form.key}
                name={form.key}
                // defaultValue={props.form.initialValue}
            />
        ),
    }

    return <>{a[form.type]}  {additionalForm}</>
}