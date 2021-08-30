const indentIncrementLen = 2;

// FYI: https://developers.google.com/apps-script/guides/web?hl=en
function doGet(e) {
  if (!('formurl' in e.parameters)) {
    throw new Error("フォームのURLを与えるクエリパラメータ 'formurl' が必須です");
  }

  // NOTE: FormApp.openByUrl can't accept form URL Without "edit" segment.
  const form = FormApp.openByUrl(e.parameters['formurl'] as string);

  return convertToHtml(form);
}

function convertToHtml(form: Form): TextOutput {

  const builders: Array<HtmlElementBuilder> = [];
  builders.push(new TitleBuilder(form.getTitle(), form.getDescription()));
  for (const i of form.getItems()) {
    builders.push(generateBuilder(i));
  }

  const rootBuilder = new RootBuilder(builders);
  return ContentService.createTextOutput(rootBuilder.build(0));
}

function generateBuilder(item: Item): HtmlElementBuilder {

  // Ref: https://developers.google.com/apps-script/reference/forms/item-type
  switch(item.getType()) {
    case FormApp.ItemType.CHECKBOX:
      return new CheckboxBuilder(item.asCheckboxItem());
    case FormApp.ItemType.MULTIPLE_CHOICE:
      return new RadioButtonBuilder(item.asMultipleChoiceItem());
    case FormApp.ItemType.LIST:
      return new PullDownBuilder(item.asListItem());
    default:
      console.log(`${item.getType().name()} hasn't supported yet`);
      return new NOPBuilder();
  }
}

interface HtmlElementBuilder {
  public build(indentStartLen: number): string;
}

class NOPBuilder implements HtmlElementBuilder {
  public build(indentStartLen: number) {
    return "";
  }
}

// Ref: https://developers.google.com/apps-script/reference/forms/checkbox-item
class CheckboxBuilder implements HtmlElementBuilder {
  private item: CheckboxItem;
  constructor(item: CheckboxItem) {
    this.item = item;
  }

  // TODO: 必須属性に対応できていない。(type=checkboxのrequiredは個々のcheckboxにしか聞かない)
  public build(indentStartLen: number): string {
    const indentStart = " ".repeat(indentStartLen);
    const indentIncrement = " ".repeat(indentIncrementLen);

    let indentLevel = 0;
    let indent = indentStart + indentIncrement.repeat(indentLevel);
    let el = `${indent}<div>\n`;

    indentLevel += 1;
    indent = indentStart + indentIncrement.repeat(indentLevel);
    el += `${indent}<h2>${this.item.getTitle()}</h2>\n`;
    if (this.item.getHelpText() !== "") {
      el += `${indent}<p>${this.item.getHelpText()}</p>\n`;
    }
    for (const c of this.item.getChoices()) {
      el += `${indent}<div>\n`;

      indentLevel += 1;
      indent = indentStart + indentIncrement.repeat(indentLevel);
      // TODO: input: id/name/valueをどうやって設定するか?
      el += `${indent}<input type="checkbox" id="horns" name="horns" value="horns">\n`
      el += `${indent}<label>${c.getValue()}</label>\n`

      indentLevel -= 1;
      indent = indentStart + indentIncrement.repeat(indentLevel);
      el += `${indent}</div>\n`;
    }

    indentLevel -= 1;
    indent = indentStart + indentIncrement.repeat(indentLevel);
    el += `${indent}</div>`;

    return el;
  }
}

// Ref: https://developers.google.com/apps-script/reference/forms/multiple-choice-item
class RadioButtonBuilder implements HtmlElementBuilder {
  private item: MultipleChoiceItem;
  constructor(item: MultipleChoiceItem) {
    this.item = item;
  }

  public build(indentStartLen: number): string {
    const indentStart = " ".repeat(indentStartLen);
    const indentIncrement = " ".repeat(indentIncrementLen);

    let indentLevel = 0;
    let indent = indentStart + indentIncrement.repeat(indentLevel);
    let el = `${indent}<div>\n`;

    indentLevel += 1;
    indent = indentStart + indentIncrement.repeat(indentLevel);
    el += `${indent}<h2>${this.item.getTitle()}</h2>\n`;
    if (this.item.getHelpText() !== "") {
      el += `${indent}<p>${this.item.getHelpText()}</p>\n`;
    }
    for (const c of this.item.getChoices()) {
      el += `${indent}<div>\n`;

      indentLevel += 1;
      indent = indentStart + indentIncrement.repeat(indentLevel);
      // TODO: input: id/name/valueをどうやって設定するか?
      el += `${indent}<input type="radio" id="horns" name="horns" value="horns" ${this.item.isRequired()? "required": ""}>\n`
      el += `${indent}<label>${c.getValue()}</label>\n`

      indentLevel -= 1;
      indent = indentStart + indentIncrement.repeat(indentLevel);
      el += `${indent}</div>\n`;
    }

    indentLevel -= 1;
    indent = indentStart + indentIncrement.repeat(indentLevel);
    el += `${indent}</div>`;

    return el;
  }
}

// Ref: https://developers.google.com/apps-script/reference/forms/list-item
class PullDownBuilder implements HtmlElementBuilder {
  private item: ListItem;
  constructor(item: ListItem) {
    this.item = item;
  }

  // TODO: 必須属性に対応できていない。最初の『選択して下さい』項目についてグレーアウトして、かつ選択可能にしなければならない。
  public build(indentStartLen: number): string {
    const indentStart = " ".repeat(indentStartLen);
    const indentIncrement = " ".repeat(indentIncrementLen);

    let indentLevel = 0;
    let indent = indentStart + indentIncrement.repeat(indentLevel);
    let el = `${indent}<div>\n`;

    indentLevel += 1;
    indent = indentStart + indentIncrement.repeat(indentLevel);
    el += `${indent}<h2>${this.item.getTitle()}</h2>\n`;
    if (this.item.getHelpText() !== "") {
      el += `${indent}<p>${this.item.getHelpText()}</p>\n`;
    }
    // TODO: select: id/nameをどうやって設定するか?
    el += `${indent}<select id="choice" name="choice" ${this.item.isRequired()? "required": ""}>\n`

    indentLevel += 1;
    indent = indentStart + indentIncrement.repeat(indentLevel);
    // FYI: https://qiita.com/airostmeta/items/918546a1ac59525036b6
    // ただしこれでは戻れないため不十分
    el += `${indent}<option value="noselect" disabled selected>選択して下さい</option>\n`
    for (const c of this.item.getChoices()) {

      // TODO: option: valueをどうやって設定するか?
      el += `${indent}<option value="horns">${c.getValue()}</option>\n`
    }

    indentLevel -= 1;
    indent = indentStart + indentIncrement.repeat(indentLevel);
    el += `${indent}</select>\n`

    indentLevel -= 1;
    indent = indentStart + indentIncrement.repeat(indentLevel);
    el += `${indent}</div>`;

    return el;
  }
}

class TitleBuilder implements HtmlElementBuilder {
  private title: string;
  private description: string;
  constructor(title: string, description: string) {
    this.title = title;
    this.description = description;
  }

  public build(indentStartLen: number): string {
    const indentStart = " ".repeat(indentStartLen);
    const indentIncrement = " ".repeat(indentIncrementLen);

    const indentLevel = 0;
    const indent = indentStart + indentIncrement.repeat(indentLevel);
    let el = `${indent}<h1>${this.title}</h1>\n`;
    el += `${indent}<p>${this.description}</p>`;

    return el;
  }
}

class RootBuilder implements HtmlElementBuilder {
  private builders: Array<HtmlElementBuilder>;
  constructor(builders: Array<HtmlElementBuilder>) {
    this.builders = builders;
  }

  public build(indentStartLen: number): string {
    const indentStart = " ".repeat(indentStartLen);
    const indentIncrement = " ".repeat(indentIncrementLen);

    let indentLevel = 0;
    let indent = indentStart + indentIncrement.repeat(indentLevel);
    let el = `${indent}<html>\n`;

    indentLevel += 1;
    indent = indentStart + indentIncrement.repeat(indentLevel);
    el += `${indent}<body>\n`;

    indentLevel += 1;
    for (const b of this.builders) {
      el += `${b.build(indentStartLen + indentLevel * indentIncrementLen)}\n`;
    }

    indentLevel -= 1;
    indent = indentStart + indentIncrement.repeat(indentLevel);
    el += `${indent}<body>\n`;

    indentLevel -= 1;
    indent = indentStart + indentIncrement.repeat(indentLevel);
    el += `${indent}</html>`;

    return el;
  }
}
