/* global document */
let lastPickedObject;
let lastTooltip;

export default function getTooltip(pickedInfo) {
  if (!pickedInfo.picked) {
    return null;
  }
  if (pickedInfo.object === lastPickedObject) {
    return lastTooltip;
  }
  const tooltip = {
    html: tabularize(pickedInfo.object),
    style: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      display: 'flex',
      flex: 'wrap',
      maxWidth: '500px',
      flexDirection: 'column',
      zIndex: 2
    }
  };
  lastTooltip = tooltip;
  lastPickedObject = pickedInfo.object;
  return tooltip;
}

const EXCLUDES = new Set(['position', 'index']);

function tabularize(json) {
  // Turns a JSON object of picked info into HTML for a tooltip
  const dataTable = document.createElement('div');
  dataTable.className = 'dataTable';

  // Creates rows of two columns for the tooltip
  for (const key in json) {
    if (EXCLUDES.has(key)) {
      continue; // eslint-disable-line
    }
    const header = document.createElement('div');
    header.className = 'header';
    header.innerText = key;

    const valueElement = document.createElement('div');
    valueElement.className = 'value';

    valueElement.innerText = toText(json[key]);

    const row = document.createElement('div');

    setStyles(row, header, valueElement);

    row.appendChild(header);
    row.appendChild(valueElement);
    dataTable.appendChild(row);
  }
  return dataTable.innerHTML;
}

function setStyles(row, header, value) {
  // Set default tooltip style
  Object.assign(header.style, {
    fontWeight: 700,
    marginRight: '10px',
    flex: 1
  });

  Object.assign(value.style, {
    flex: 'none',
    maxWidth: '250px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  });

  Object.assign(row.style, {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  });
}

function toText(jsonValue) {
  // Set contents of table value, trimming for certain types of data
  let text;
  if (Array.isArray(jsonValue) && jsonValue.length > 4) {
    text = `Array<${jsonValue.length}>`;
  } else {
    try {
      text = JSON.stringify(jsonValue);
    } catch (err) {
      text = '<Non-Serializable Object>';
    }
  }
  const MAX_LENGTH = 50;
  if (text.length > MAX_LENGTH) {
    text = text.slice(0, MAX_LENGTH);
  }
  return text;
}
