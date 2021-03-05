"use strict";

const SORT_ASC = "asc";
const SORT_DESC = "desc";

// TODO: REMOVE
function _USAGE() {
    createDatatable("#myContainer"                      /* #id, .class or element to insert the table */,
        {
            // data: data,                                  /* the source data to display in the table, for example a list of objects */
            // ajax: "../../data/colors.json",              /* the URL to load the data from */
            // header: [],                                  /* the header of the table, if omited the `data` keys will be used instead */
            // currentPage: 0,                              /* the current page of the table, by default 0 */
            // paginate: false,                             /* enable pagination in the table, by default true */
            // minRows: 0,                                  /* the minimun numbers of rows to display per page, by default 0 */
            // maxRows: 10,                                 /* the maximun numbers of rows to display per page, by default display all the rows */
            // previousButtonText: "Previous",              /* text displayed in the `Previous` button of the paginator */
            // nextButtonText: "Next",                      /* text displayed in the `Next` button of the paginator */
            // pageButtonCount: 10,                         /* numbers of buttons to display in the paginator */
            // hover: false,                                /* enable row hover, by default true */
            // centerText: true,                            /* center the text of the cells, by default false */
            // scrollX: true,                               /* enable horizontal scroll if the table overflows, by default false */
            // scrollY: 300,                                /* enable vertical overflow within the given heigh for example `30vw` or `300`px */
            // sortable: false,                             /* enable sorting in the table, by default true */
            // searchable: false,                           /* enable searching in the table, by default true */
            // searchLabelText: "Search: ",                 /* the text of the search input label */
            // columnSelection: false,                      /* enable column selection. If no `false` and the column is `sortable` will be enable */
            // rowSelection: true,                          /* enable row selection */
            // columns: {},                                 /* the data used for display the columns */
            // styles: [],                                  /* the styles applied to the table, See datatable.js 'TableStyles' */
            // classes: {},                                 /* the classes to apply to certain elements, in the form: { element: classes } */
            // attributes: {}                               /* the attributes apply to certain elements, in the form: { element: { attribute: value } } */
        });
}

// Table styles
const TableStyles = {
    // Alternates the colors of the even rows
    STRIPED: "striped",
    // Alternates the colors of the odd rows
    STRIPED_INVERTED: "striped-inverted",
    // Removes the padding from the rows
    COMPACT: "compact",
    // Adds bottom and top border to the rows
    ROW_BORDER: "row-border",
    // Adds left and right border to the columns
    COL_BORDER: "column-border",
    // Adds highlight color when hovering a row
    HOVER_ROW: "hover-row",
    // Adds highlight color when selecting a column header
    HOVER_COL: "hover-column",
};

// Default styles of a table, use "default" in styles to add these.
const DEFAULT_STYLES = [TableStyles.STRIPED, TableStyles.HOVER_COL, TableStyles.HOVER_ROW];

/**
 * A html table generator.
 */
class DataTable {
    /**
     * Constructs a new `DataTable`
     * 
     * @param {String|Element} element the element where the datatable will be created.
     * @param {Object} options configuration of the datatable.
     * @param {any[]} options.data the source data to display in the table.
     * @param {string} options.ajax the URL to load the data from.
     * @param {String[]} options.header the header of the table, if omited the `options.data` keys will be used instead.
     * @param {Number} options.currentPage the current page of the table, by default 0.
     * @param {Boolean} options.paginate enable pagination in the table, by default true.
     * @param {Number} options.maxRows the maximun numbers of rows to display per page, by default display all the rows.
     * @param {Number} options.minRows the minimun numbers of rows to display per page, by default 0.
     * @param {String} options.previousButtonText text displayed in the `Previous` button of the paginator.
     * @param {String} options.nextButtonText text displayed in the `Next` button of the paginator.
     * @param {Number} options.pageButtonCount numbers of buttons to display in the paginator.
     * @param {Boolean} options.hover enable row hover, by default true.
     * @param {Boolean} options.centerText center the text of the cells, by default false.
     * @param {Boolean} options.scrollX enable horizontal scroll if the table overflows, by default false.
     * @param {Number|String} options.scrollY enable vertical overflow within the given heigh for example `30vw` or `300`px.
     * @param {Boolean} options.sortable enable sorting in the table.
     * @param {Boolean} options.searchable enable searching in the table.
     * @param {String} options.searchLabelText the text of the search input label, by default "Search: ".
     * @param {Boolean} options.columnSelection enable column selection. If no `false` and the column is `sortable` will be enable.
     * @param {Boolean} options.rowSelection enable row selection.
     * @param {Boolean} options.columns the data used for display the columns.
     * @param {string[]} options.style the styles applied to the table. @see TableStyles.
     * @param {Object} options.classes an object to apply classes to the datatable elements in the form: `{"element": "classes"}`
     * @param {Object} option.attributes an object to apply attributes to the datatable elements in the form: `{"element" : { "attribute" : "value" }}`
     */
    constructor(element, options) {
        if (element == null) {
            throw new Error("DataTable `element` cannot be null");
        }

        if (options == null) {
            throw new Error("DataTable `options` cannot be null");
        }

        // Table data
        this.header = options.header;
        this.ajax = options.ajax;
        this.data = this.ajax ? this.#fetchJsonArrayData(this.ajax) : (options.data ?? []);

        if (this.header == null) {
            if (this.data == null || this.data.length === 0) {
                throw new Error("A 'header' must be provided if the data is null or empty");
            }

            // Takes the first object keys as the header
            this.header = Object.keys(this.data[0]);
        }

        if (this.data != null && this.data.length > 0) {
            if (this.header.length < Object.keys(this.data[0]).length) {
                throw new Error("'header' cannot have less elements than the data items");
            }
        }

        // Table options
        this.currentPage = options.currentPage ?? 0;
        this.paginate = options.paginate ?? true;
        this.maxRows = options.maxRows ?? Number.MAX_SAFE_INTEGER;
        this.minRows = options.minRows ?? 0;
        this.previousButtonText = options.previousButtonText ?? "«";
        this.nextButtonText = options.nextButtonText ?? "»";
        this.pageButtonCount = options.pageButtonCount ?? 10;
        this.hover = options.hover ?? true;
        this.centerText = options.centerText ?? false;
        this.scrollX = options.scrollX ?? false;
        this.scrollY = options.scrollY;
        this.sortable = options.sortable ?? true;
        this.searchable = options.searchable ?? true;
        this.searchLabelText = options.searchLabelText === undefined ? "Search: " : options.searchLabelText;
        this.columnSelection = options.columnSelection ?? this.sortable;
        this.rowSelection = options.rowSelection ?? false;
        this.columns = DataTable.#createColumnsData(this.header, options.columns);
        this.styles = options.styles ?? DEFAULT_STYLES;
        this.classes = options.classes;
        this.attributes = options.attributes;

        // Styling
        if (this.styles.includes("default")) {
            this.styles = this.styles.filter(s => s != "default");
            this.styles.push(...DEFAULT_STYLES);
        }

        if (this.hover) {
            if (!this.styles.includes(TableStyles.HOVER_ROW)) {
                this.styles.push(TableStyles.HOVER_ROW);
            }
        } else {
            this.styles = this.styles.filter(s => s != TableStyles.HOVER_ROW);
        }

        if (this.columnSelection) {
            if (!this.styles.includes(TableStyles.HOVER_COL)) {
                this.styles.push(TableStyles.HOVER_COL);
            }
        } else {
            this.styles = this.styles.filter(s => s != TableStyles.HOVER_COL);
        }

        // Footer
        if (options.foot != null) {
            if (typeof options.foot === "boolean") {
                this.foot = options.foot ? this.header : null;
            } else {
                this.foot = options.foot;
            }
        }

        // Transforms the data in the datatable for example sorting or filtering.
        this.transformers = [];

        // Assertions
        for (const key in options) {
            if (!this.hasOwnProperty(key)) {
                throw new Error(`Unexpected property '${key}' for DataTable`);
            }
        }

        const STYLES = Object.values(TableStyles);
        for (const s of this.styles) {
            if (!STYLES.includes(s)) {
                throw new Error(`Invalid style value '${s}' expected one of: ${STYLES}`);
            }
        }

        console.assert(this.minRows <= this.maxRows, "'minRows' must be lower of equals to 'maxRows'");
        console.assert(this.isValidPage(this.currentPage), `invalid 'currentPage' ${this.currentPage} max is ${this.pageCount()}`);

        // Constructs the datadable
        DataTable.#createDataTableOnElement(this, element);
    }

    static #createDataTableOnElement(dataTable, element) {
        const root = typeof element === "string" ? document.querySelector(element) : element;

        if (root === null) {
            throw new Error(`Cannot find ${element}`);
        } else {
            root.appendChild(dataTable.toNode());
        }
    }

    static #createColumnsData(header, columns) {
        const columnsData = [];

        // Asserts columns keys
        for (const key in columns) {
            if (!header.includes(key)) {
                throw new Error(`column '${key}' is no in the header: ${header}`);
            }
        }

        for (let i = 0; i < header.length; i++) {
            const key = header[i];
            if (columns && key in columns) {
                const col = columns[key];
                columnsData.push(new ColumnData(key, i, col.sortable, col.searchable, col.render));
            } else {
                columnsData.push(new ColumnData(key, i));
            }
        }

        return columnsData;
    }

    #fetchJsonArrayData(url) {
        const data = [];
        const request = new XMLHttpRequest();

        request.onreadystatechange = () => {
            if (request.readyState == 4 && request.status == 200) {
                const text = request.responseText;
                const json = JSON.parse(text);

                // The first key value should be the array of objects.
                const key = Object.keys(json)[0];
                const arrayData = json[key];
                if (arrayData == null) {
                    throw new Error(`couldn't load '${url}'`);
                }

                if (!Array.isArray(arrayData)) {
                    throw new TypeError("Loaded data is not a json array");
                }

                data.push(...arrayData);
            }
        };

        request.open("GET", url, false);
        request.send();
        return data;
    }

    /**
     * Returns `true` if the given page index is valid for this datatable.
     */
    isValidPage(page) {
        const count = this.pageCount();
        if (page < 0 || page > count) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Returns the number of entries of this datatable.
     */
    count() {
        return this.data.length;
    }

    /**
     * Returns the number of pages in this datatable.
     */
    pageCount() {
        return Math.ceil(this.getData().length / this.maxRows);
    }

    /**
     * Moves to the specified page index. 
     * 
     * Returns `true` if moved otherwise false.
     */
    moveToPage(page) {
        if (this.isValidPage(page) && page !== this.currentPage) {
            this.currentPage = page;
            this.render();
            return true;
        }

        return false;
    }

    /**
     * Moves to the next page.
     */
    nextPage() {
        return this.moveToPage(this.currentPage + 1);
    }

    /**
     * Moves to the previous page.
     */
    prevPage() {
        return this.moveToPage(this.currentPage - 1);
    }

    /**
     * Adds a new item to the datatable. 
     * The item must have the same numbers of fields than the header.
     */
    add(item) {
        if (item == null) {
            this.data.push(item);
        } else {
            if (this.header.length !== Object.keys(item).length) {
                throw new Error(`Invalid item, do not match header length: ${this.header}`);
            }

            this.data.push(item);
        }
    }

    /**
     * Removes items from the given range.
     * @param {Number} startIndex the start index.
     * @param {Number} endIndex the end index, if undefined will be the same as `startIndex`.
     */
    remove(startIndex, endIndex) {
        if (endIndex == null) {
            endIndex = startIndex + 1;
        }

        if (typeof startIndex !== "number" || typeof endIndex !== "number") {
            throw new TypeError("indices must be a number");
        }

        if (startIndex > endIndex) {
            throw new Error('Invalid indices ranges');
        }

        const items = this.data;
        const length = items.length;

        if (startIndex < 0 || startIndex > length) {
            throw new Error(`'startIndex' out of range, length is ${length} but index was ${startIndex}`);
        }

        if (endIndex < 0 || endIndex > length) {
            throw new Error(`'endIndex' out of range, length is ${length} but index was ${endIndex}`);
        }

        const count = endIndex - startIndex;
        return this.data.splice(startIndex, count);
    }

    /**
     * Removes all the entries of this datatable.
     */
    clear() {
        this.data = [];
    }

    /**
     * Sorts the items of this datatable.
     * @param {(any,any)=>Number} compare the compare function.
     */
    sort(compare) {
        this.transformers.push((pageData) => pageData.sort(compare));
        return this;
    }

    /**
     * Sorts the items by ascending of this datatable by the given key.
     * @param {(any)=>any} keySelector provides the key used to sort the table.
     */
    sortBy(keySelector) {
        if (keySelector == null) {
            keySelector = identity();
        }

        return this.sort((objA, objB) => {
            const keyA = keySelector(objA);
            const keyB = keySelector(objB);
            return compare(keyA, keyB)
        });
    }

    /**
     * Sorts the items by decending of this datatable by the given key.
     * @param {(any)=>any} keySelector provides the key used to sort the table.
     */
    sortByDecending(keySelector) {
        if (keySelector == null) {
            keySelector = identity();
        }

        return this.sort((objA, objB) => {
            const keyA = keySelector(objA);
            const keyB = keySelector(objB);
            return compare(keyB, keyA)
        });
    }

    /**
     * Filters the content of this datatable using the given predicate.
     * @param {(any)=>bool} predicate the predicate used to filter the content.
     */
    filter(predicate) {
        this.transformers.push((pageData) => pageData.filter(predicate));
        return this;
    }

    /**
     * Gets only the unique elements of the datatable by the given key.
     * @param {(any)=>any} keySelector the key used to get the unique elements.
     */
    unique(keySelector) {
        if (keySelector == null) {
            keySelector = identity();
        }

        this.transformers.push((columnsData) => {
            const array = [];
            for (const e of columnsData) {
                const key = keySelector(e);
                if (!array.some(value => keySelector(value) == key)) {
                    array.push(e);
                }
            }

            return array;
        });

        return this;
    }

    /**
     * Remove all the transformers used by this datatable, like sorting or filtering.
     */
    removeTransformers() {
        this.transformers = [];
    }

    /**
     * Renders this datatable.
     * 
     * This method should be called each time a change happens, like add, remove or sort.
     */
    render() {
        if (this.dataTable == null) {
            return;
        }

        const dataTable = this.dataTable;
        const tableContainer = dataTable.getElementsByClassName("table-container")[0];
        const paginatorContainer = dataTable.getElementsByClassName("paginator-container")[0];

        tableContainer.replaceChild(this.renderTableNode(), tableContainer.firstChild);
        paginatorContainer.replaceChild(this.renderPaginatorNode(), paginatorContainer.firstChild);
    }

    ////////////////////////// Internal Methods //////////////////////////
    getData() {
        let data = this.data;

        // We apply the transformers before returns the data
        if (this.transformers.length > 0) {
            for (const f of this.transformers) {
                data = f(data, this.columns);
            }
        }

        return data;
    }

    getCurrentPageData() {
        let pageData = this.getData();
        const startIndex = this.currentPage * this.maxRows;
        const endIndex = Math.min(startIndex + this.maxRows, pageData.length);
        pageData = pageData.slice(startIndex, endIndex);

        if (pageData.length < this.minRows) {
            let count = this.minRows - pageData.length;
            while (count > 0) {
                pageData.push(null);
                count -= 1;
            }
        }

        return pageData;
    }

    selectColumn(column, index) {
        if (this.columnSelection) {
            const temp = this.selectColumn;
            this.selectedColumn = index;
            this.prevSelectedColumn = temp;
        }

        if (this.sortable) {
            if (!this.columns[index].sortable) {
                return;
            }

            if (this.sorting == null) {
                this.sorting = {
                    index: index,
                    column: column,
                    sortBy: SORT_ASC
                };
            } else {
                const sorting = this.sorting;
                sorting.column.classList.remove(sorting.sortBy);

                if (sorting.index !== index) {
                    sorting.sortBy = SORT_ASC;
                } else {
                    sorting.sortBy = sorting.sortBy === SORT_ASC ? SORT_DESC : SORT_ASC;
                }

                sorting.column = column;
                sorting.index = index;
            }

            column.classList.add(this.sorting.sortBy);

            // Sorts the data by the specified column
            this.sort((objA, objB) => {
                const index = this.sorting.index;
                const x = objA[Object.keys(objA)[index]]
                const y = objB[Object.keys(objB)[index]]
                return this.sorting.sortBy === SORT_ASC ? compare(x, y) : compare(y, x);
            });
        }

        // Renders the table after sorting
        this.render();
    }

    onTableColumn(tableCell, columnIndex) {
        if (this.columnSelection) {
            if (this.prevSelectedColumn === columnIndex) {
                tableCell.classList.remove("selected");
            }

            if (this.selectedColumn === columnIndex) {
                tableCell.classList.add("selected");
            }
        }
    }

    onTableRow(tableRow, rowIndex) {
        // rowIndex === 0 is the header
        if (rowIndex > 0) {
            // Table row selection
            if (this.rowSelection) {
                tableRow.classList.add("selectable");
                tableRow.addEventListener("click", () => {
                    if (this.selectedRow && this.selectedRow === rowIndex) {
                        this.prevSelectedRow = rowIndex;
                        this.selectedRow = null;
                    } else {
                        const tempRow = this.selectedRow;
                        this.selectedRow = rowIndex;
                        this.prevSelectedRow = tempRow;
                    }

                    this.render();
                });

                if (this.selectedRow === rowIndex) {
                    tableRow.classList.add("selected");
                }
            }

            // Marks the rows as even or odds
            if (rowIndex % 2 === 0) {
                tableRow.classList.add("even");
            } else {
                tableRow.classList.add("odd");
            }
        }
    }

    renderDatatableNode(table) {
        const dataTable = document.createElement("div");
        dataTable.className = "datatable-container";

        // TODO: rename to datatableContainer or container
        if (this.dataTable == null) {
            this.dataTable = dataTable;
        }

        if (this.searchable) {
            const searchContainer = document.createElement("div");
            searchContainer.className = "searchbar-container";
            searchContainer.appendChild(this.renderSearchBarNode());
            dataTable.appendChild(searchContainer);
        }

        if (this.paginate) {
            // Container for the `table`
            const tableContainer = document.createElement("div");
            tableContainer.className = "table-container";
            tableContainer.appendChild(table);
            dataTable.appendChild(tableContainer);

            // Container for the `paginator`
            const paginatorContainer = document.createElement("div");
            paginatorContainer.className = "paginator-container";
            paginatorContainer.appendChild(this.renderPaginatorNode());
            dataTable.appendChild(paginatorContainer);
        } else {
            dataTable.appendChild(table);
        }

        this.applyClasses(dataTable);
        this.applyAttributes(dataTable);

        return dataTable;
    }

    renderSearchBarNode() {
        const container = document.createElement("div");
        container.className = "searchbar";

        const id = getNextID("searchbar-input");
        const input = document.createElement("input");
        input.setAttribute("id", id)

        input.addEventListener("input", (event) => {
            this.filter((data) => {
                const objectKeys = Object.keys(data);
                for (const col of this.columns) {
                    if (col.searchable && col.index < objectKeys.length) {
                        const key = objectKeys[col.index];
                        const value = data[key]?.toString().toLowerCase();
                        if (value && value.includes(event.target.value.toLowerCase())) {
                            return true;
                        }
                    }
                }

                return false;
            });

            // Renders after the change.
            this.render();
        })

        if (this.searchLabelText) {
            const inputLabel = document.createElement("label");
            inputLabel.setAttribute("for", id)
            inputLabel.innerHTML = this.searchLabelText;
            container.appendChild(inputLabel);
        }

        container.appendChild(input);

        return container;
    }

    renderPaginatorNode() {
        const paginator = document.createElement("div");
        paginator.className = "paginator";

        const pageCount = this.pageCount();
        if (pageCount > 1) {
            // Previous button
            const prevBtn = document.createElement("button");
            prevBtn.innerText = this.previousButtonText;
            prevBtn.classList.add("previousPageBtn");

            if (this.currentPage === 0) {
                prevBtn.classList.add("inactive");
            } else {
                prevBtn.addEventListener("click", this.prevPage.bind(this));
            }

            paginator.appendChild(prevBtn);

            // Page buttons
            if (pageCount < this.pageButtonCount) {
                for (let i = 0; i < pageCount; i++) {
                    const pageBtn = document.createElement("button");
                    pageBtn.classList.add("pageBtn");
                    pageBtn.innerText = i + 1;

                    if (this.currentPage === i) {
                        pageBtn.classList.add("active");
                    }

                    pageBtn.addEventListener("click", this.moveToPage.bind(this, i));
                    paginator.appendChild(pageBtn);
                }
            } else {
                const count = Math.min(this.pageButtonCount, pageCount);
                for (let i = 0; i < count; i++) {
                    const pageBtn = document.createElement("button");
                    pageBtn.classList.add("pageBtn");
                    let index;

                    if (this.currentPage + this.pageButtonCount >= pageCount) {
                        index = (pageCount - this.pageButtonCount) + i + 1;
                    } else {
                        index = this.currentPage + i + 1;
                    }

                    pageBtn.innerText = index;

                    if (this.currentPage === index - 1) {
                        pageBtn.classList.add("active");
                    }

                    pageBtn.addEventListener("click", this.moveToPage.bind(this, index));
                    paginator.appendChild(pageBtn);
                }
            }

            // Next button
            const nextBtn = document.createElement("button");
            nextBtn.classList.add("nextPageBtn");
            nextBtn.innerText = this.nextButtonText;

            if (this.currentPage === pageCount - 1) {
                nextBtn.classList.add("inactive");
            } else {
                nextBtn.addEventListener("click", this.nextPage.bind(this));
            }

            paginator.appendChild(nextBtn);
        }

        return paginator;
    }

    renderTableNode() {
        let tableNode = document.createElement("table");
        tableNode.className = "datatable";
        tableNode.classList.add(...this.styles);

        // Creates the table header
        const tableHeader = document.createElement("thead");
        const tableHeaderRow = document.createElement("tr");

        for (let i = 0; i < this.header.length; i++) {
            const element = this.header[i];
            const th = document.createElement("th");
            th.innerHTML = element ?? "";

            if (this.centerText) {
                th.classList.add("text-center");
            }

            if (this.sortable) {
                th.classList.add("sortable");

                if (this.sorting && this.sorting.index === i) {
                    th.classList.add(this.sorting.sortBy);
                }
            }

            if (this.columnSelection || this.sortable) {
                //th.addEventListener("click", this.selectColumn.bind(this, th, i));
                th.addEventListener("click", () => this.selectColumn(th, i));
            }

            this.onTableColumn(th, i);
            tableHeaderRow.appendChild(th);
        }

        this.onTableRow(tableHeaderRow, 0);
        tableHeader.appendChild(tableHeaderRow);
        tableNode.appendChild(tableHeader);

        // Creates the table rows
        const pageData = this.getCurrentPageData();
        const tableBody = document.createElement("tbody");

        for (let rowIndex = 0; rowIndex < pageData.length; rowIndex++) {
            const data = pageData[rowIndex];
            const tr = document.createElement("tr");

            // Current column
            let colIndex = 0;

            if (data !== null) {
                // TODO: Inneccesary loop
                for (const _ in data) {
                    const td = document.createElement("td");
                    td.innerHTML = this.columns[colIndex].render(data, rowIndex, colIndex);
                    tr.appendChild(td);

                    this.onTableColumn(td, colIndex);
                    colIndex += 1;
                }
            }

            // Insert empty cells if the current row length is less than the header
            for (; colIndex < this.header.length; colIndex++) {
                const td = document.createElement("td");
                td.innerHTML = this.columns[colIndex].render(data, rowIndex, colIndex);
                this.onTableColumn(td, colIndex);
                tr.appendChild(td);
            }

            if (this.centerText) {
                tr.classList.add("text-center");
            }

            this.onTableRow(tr, rowIndex + 1);
            tableBody.appendChild(tr);
        }

        // Create table footer
        if (this.foot) {
            const foot = document.createElement("tfoot");
            const tr = document.createElement("tr");

            if (typeof this.foot === "string") {
                const th = document.createElement("th");
                th.setAttribute("colspan", this.header.length);
                th.innerHTML = this.foot;
                tr.appendChild(th);
            } else {
                for (const s of this.foot) {
                    const th = document.createElement("th");
                    th.innerHTML = s;
                    tr.appendChild(th);
                }
            }

            foot.appendChild(tr);
            tableNode.appendChild(foot);
        }

        tableNode.appendChild(tableBody);

        // vertical scroll
        if (this.scrollY) {
            const scrollYContainer = document.createElement("div");
            scrollYContainer.classList.add("scroll-y");
            scrollYContainer.style.maxHeight = typeof this.scrollY === "number" ? `${this.scrollY}px` : this.scrollY;
            scrollYContainer.appendChild(tableNode);
            tableNode = scrollYContainer;
        }

        // Horizontal scroll
        if (this.scrollX) {
            const scrollXContainer = document.createElement("div");
            scrollXContainer.className = "scroll-x";
            scrollXContainer.appendChild(tableNode);
            tableNode = scrollXContainer;
        }

        return tableNode;
    }

    // { element: classes }
    applyClasses(container) {
        if (this.classes != null) {
            for (const elementName in this.classes) {
                // Get all the elements to apply the class
                const elements = container.querySelectorAll(elementName);

                // Get the classes to apply to the attributes separated by spaces
                const elementClasses = this.classes[elementName].split(" ");

                if (elements.length == 0) {
                    throw new Error(`Cannot find element '${elementName}'`);
                }

                // Add the class to all the elements
                elements.forEach(e => e.classList.add(...elementClasses));
            }
        }
    }

    // { element: {attribute: value } }
    applyAttributes(container) {
        if (this.attributes != null) {
            for (const elementName in this.attributes) {
                // Get all the elements to apply the attributes
                const elements = container.querySelectorAll(elementName);

                if (elements.length == 0) {
                    throw new Error(`Cannot find element '${elementName}'`);
                }

                // Get the attributes to apply to the current element
                const elementAttributes = this.attributes[elementName];

                // Iterate over each attribute name and apply it's value to all the elements
                for (const attributeName in elementAttributes) {
                    const attributeValue = elementAttributes[attributeName];

                    elements.forEach(e => {
                        e.setAttribute(attributeName, attributeValue);
                    })
                }
            }
        }
    }

    toNode() {
        const tableNode = this.renderTableNode();
        return this.renderDatatableNode(tableNode)
    }

    toHtml() {
        return nodeToHtml(this.toNode());
    }
}

// Defines how a column is represented.
class ColumnData {
    constructor(columnName, columnIndex, sortable, searchable, render) {
        if (columnName == null) {
            throw new Error("Column name cannot be null");
        }

        this.columnName = columnName;
        this.index = columnIndex;
        this.sortable = sortable ?? true;
        this.searchable = searchable ?? true;

        if (render == null) {
            this.render = (data, _row, _column) => {
                if (data == null) {
                    return "";
                } else {
                    const objectKeys = Object.keys(data);
                    const key = objectKeys[this.index];
                    return data[key]?.toString() ?? "";
                }
            };
        } else {
            this.render = render;
        }
    }
}

/**
 * Constructs a new `DataTable` in this element.
 * 
 * @param options Datatable options.
 */
Element.prototype.dataTable = function (options) {
    return new DataTable(this, options)
};

/**
 * Constructs a new `DataTable` in the given element.
 */
function createDatatable(element, options) {
    return new DataTable(element, options);
}

/* Utilities */
function compare(x, y) {
    if (Object.is(x, y)) {
        return 0;
    }

    if (x > y) {
        return 1;
    } else if (x < y) {
        return -1;
    } else {
        return 0;
    }
}

function nodeToHtml(node, clone = false) {
    const tempParent = document.getElementById("div");
    if (clone == null || clone === true) {
        tempParent.appendChild(node.deepClone())
    } else {
        tempParent.appendChild(node)
    }
    return tempParent.innerHTML;
}

function nodeToString(node, clone = false) {
    const tempParent = document.getElementById("div");
    if (clone == null || clone === true) {
        tempParent.appendChild(node.deepClone())
    } else {
        tempParent.appendChild(node)
    }
    return tempParent.innerText;
}

function identity(obj) {
    return obj;
}

// Unique ID generator
const getNextID = (() => {
    let id = 0;
    return function (name) {
        if (name) {
            return `${name}-${id++}`;
        } else {
            return id++;
        }
    }
})();
