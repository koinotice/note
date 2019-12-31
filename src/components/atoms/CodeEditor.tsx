import React from 'react'
import CodeMirror from '../../lib/CodeMirror'
import styled from '../../lib/styled'
import {
  EditorIndentTypeOptions,
  EditorIndentSizeOptions,
  EditorKeyMapOptions
} from '../../lib/preferences'

const StyledContainer = styled.div`
  .CodeMirror {
    font-family: inherit;
  }
`

const defaultCodeMirrorOptions: CodeMirror.EditorConfiguration = {
  lineWrapping: true,
  lineNumbers: true
}

interface CodeEditorProps {
  value: string
  onChange: (
    newValue: string,
    change: CodeMirror.EditorChangeLinkedList
  ) => void
  codeMirrorRef?: (codeMirror: CodeMirror.EditorFromTextArea) => void
  className?: string
  theme?: string
  fontSize?: number
  fontFamily?: string
  indentType?: EditorIndentTypeOptions
  indentSize?: EditorIndentSizeOptions
  keyMap?: EditorKeyMapOptions
  mode?: string
  readonly?: boolean
}

class CodeEditor extends React.Component<CodeEditorProps> {
  textAreaRef = React.createRef<HTMLTextAreaElement>()
  codeMirror?: CodeMirror.EditorFromTextArea

  componentDidMount() {
    const indentSize = this.props.indentSize == null ? 2 : this.props.indentSize
    const keyMap =
      this.props.keyMap == null || this.props.keyMap === 'default'
        ? 'sublime'
        : this.props.keyMap
    this.codeMirror = CodeMirror.fromTextArea(this.textAreaRef.current!, {
      ...defaultCodeMirrorOptions,
      theme: this.props.theme == null ? 'default' : this.props.theme,
      indentWithTabs: this.props.indentType === 'tab',
      indentUnit: indentSize,
      tabSize: indentSize,
      keyMap,
      mode: this.props.mode || 'markdown',
      readOnly: this.props.readonly === true
    })
    this.codeMirror.on('change', this.handleCodeMirrorChange)
    window.addEventListener('codemirror-mode-load', this.reloadMode)
    if (this.props.codeMirrorRef != null) {
      this.props.codeMirrorRef(this.codeMirror)
    }
  }

  reloadMode = () => {
    if (this.codeMirror != null) {
      this.codeMirror.setOption('mode', this.codeMirror.getOption('mode'))
    }
  }

  componentDidUpdate(prevProps: CodeEditorProps) {
    if (this.codeMirror == null) {
      return
    }
    if (this.props.value !== this.codeMirror.getValue()) {
      this.codeMirror.setValue(this.props.value)
    }
    if (this.props.theme !== prevProps.theme) {
      this.codeMirror.setOption('theme', this.props.theme)
    }
    if (
      this.props.fontSize !== prevProps.fontSize ||
      this.props.fontFamily !== prevProps.fontFamily
    ) {
      this.codeMirror.refresh()
    }
    if (this.props.indentType !== prevProps.indentType) {
      this.codeMirror.setOption(
        'indentWithTabs',
        this.props.indentType === 'tab'
      )
    }
    if (this.props.indentSize !== prevProps.indentSize) {
      const indentSize =
        this.props.indentSize == null ? 2 : this.props.indentSize
      this.codeMirror.setOption('indentUnit', indentSize)
      this.codeMirror.setOption('tabSize', indentSize)
    }
    if (this.props.keyMap !== prevProps.keyMap) {
      const keyMap =
        this.props.keyMap == null || this.props.keyMap === 'default'
          ? 'sublime'
          : this.props.keyMap
      this.codeMirror.setOption('keyMap', keyMap)
    }
  }

  componentWillUnmount() {
    if (this.codeMirror != null) {
      this.codeMirror.toTextArea()
    }
    window.removeEventListener('codemirror-mode-load', this.reloadMode)
  }

  handleCodeMirrorChange = (
    editor: CodeMirror.Editor,
    change: CodeMirror.EditorChangeLinkedList
  ) => {
    if (change.origin !== 'setValue') {
      this.props.onChange(editor.getValue(), change)
    }
  }

  render() {
    const { fontSize, fontFamily, value, className } = this.props

    return (
      <StyledContainer
        className={className}
        style={{
          fontSize: fontSize == null ? 'inherit' : `${fontSize}px`,
          fontFamily: fontFamily == null ? 'monospace' : fontFamily
        }}
      >
        <textarea ref={this.textAreaRef} defaultValue={value} />
      </StyledContainer>
    )
  }
}

export default CodeEditor
