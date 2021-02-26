"use strict";

const SORT_ASC = "asc";
const SORT_DESC = "desc";

/**
 * A html table generator.
 */
class DataTable {
    /**
     * Constructs a new `DataTable`
     * 
     * @param {string|Element} element the element where the datatable will be created.
     * @param {Object} options configuration of the datatable.
     * @param {any[]} options.data the source data to display in the table.
     * @param {String[]} options.header the header of the table, if omited the `options.data` keys will be used instead.
     * @param {Number} options.currentPage the current page of the table, by default 0.
     * @param {Boolean} options.paginate enable pagination in the table, by default true.
     * @param {Number} options.minRows the minimun numbers of rows to display per page, by default 0.
     * @param {Number} options.maxRows the maximun numbers of rows to display per page, by default display all the rows.
     * @param {String|any} options.previousButtonText text displayed in the `Previous` button of the paginator.
     * @param {String|any} options.nextButtonText text displayed in the `Next` button of the paginator.
     * @param {Number} options.pageButtonCount numbers of buttons to display in the paginator.
     * @param {Boolean} options.hover enable row hover, by default true.
     * @param {Boolean} options.centerText center the text of the cells, by default false.
     * @param {Boolean} options.scrollX enable horizontal scroll if the table overflows, by default false.
     * @param {Number|String} options.scrollY enable vertical overflow within the given heigh for example `30vw` or `300`px.
     * @param {Boolean} options.striped alternate the rows colors in the table.
     * @param {Boolean|string[]} options.sortable enable sorting in the table in all columns or the given column names.
     * @param {Boolean} options.searchable enable searching in the table.
     * @param {String} options.searchLabelText the text of the search input label, by default "Search: ".
     * @param {Boolean} options.columnSelection enable column selection. If no `false` and the column is `sortable` will be enable.
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
        this.data = options.data ?? [];

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
        this.minRows = options.minRows ?? 0;
        this.maxRows = options.maxRows ?? Number.MAX_SAFE_INTEGER;
        this.previousButtonText = options.previousButtonText ?? "«";
        this.nextButtonText = options.nextButtonText ?? "»";
        this.pageButtonCount = options.pageButtonCount ?? 10;
        this.hover = options.hover ?? true;
        this.centerText = options.centerText ?? false;
        this.scrollX = options.scrollX ?? false;
        this.scrollY = options.scrollY;
        this.striped = options.striped ?? true;
        this.sortable = options.sortable ?? true;
        this.searchable = options.searchable ?? true;
        this.searchLabelText = options.searchLabelText ?? "Search: ";
        this.columnSelection = options.columnSelection;
        this.rowSelection = options.rowSelection;

        if (this.columnSelection == null && this.sortable != null) {
            this.columnSelection = true;
        }

        // Transforms the data in the datatable for example sorting or filtering.
        this.transformers = [];

        // Assertions
        for (const key in options) {
            if (!this.hasOwnProperty(key)) {
                throw new Error(`Unexpected property '${key}' for DataTable`);
            }
        }

        if (Array.isArray(this.sortable)) {
            this.sortable.forEach(e => {
                if (!this.header.includes(e)) {
                    throw new Error(`Invalid sortable column, '${e}' is no part of the header: [${this.header}]`);
                }
            })
        }

        if (Array.isArray(this.searchable)) {
            this.searchable.forEach(e => {
                if (!this.header.includes(e)) {
                    throw new Error(`Invalid searchable column, '${e}' is no part of the header: [${this.header}]`);
                }
            })
        }

        console.assert(this.minRows <= this.maxRows, "'minRows' must be lower of equals to 'maxRows'");
        console.assert(this.isValidPage(this.currentPage), `invalid 'currentPage' ${this.currentPage} max is ${this.pageCount()}`);

        // Constructs the datadable
        DataTable.createDataTableOnElement(this, element);
    }

    static createDataTableOnElement(dataTable, element) {
        const root = typeof element === "string" ? document.querySelector(element) : element;

        if (root === null) {
            throw new Error(`Cannot find ${element}`);
        } else {
            root.appendChild(dataTable.toNode());
        }
    }

    isValidPage(page) {
        const count = this.pageCount();
        if (page < 0 || page > count) {
            return false;
        } else {
            return true;
        }
    }

    pageCount() {
        return Math.ceil(this.data.length / this.maxRows);
    }

    moveToPage(page) {
        if (this.isValidPage(page) && page !== this.currentPage) {
            this.currentPage = page;
            this.render();
        }
    }

    nextPage() {
        this.moveToPage(this.currentPage + 1);
    }

    prevPage() {
        this.moveToPage(this.currentPage - 1);
    }

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

    clear() {
        this.data = [];
    }

    sort(compare) {
        this.transformers.push((pageData) => pageData.sort(compare));
        this.render();
        return this;
    }

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

    filter(predicate) {
        this.transformers.push((pageData) => pageData.filter(predicate));
        this.render();
        return this;
    }

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

        this.render();
        return this;
    }

    removeTransformers(){
        this.transformers = [];
    }

    getCurrentPageColumnsData() {
        const startIndex = this.currentPage * this.maxRows;
        const endIndex = Math.min(startIndex + this.maxRows, this.data.length);
        let pageData = this.data.slice(startIndex, endIndex);

        if (this.transformers.length > 0) {
            for (const f of this.transformers) {
                pageData = f(pageData);
            }
        }

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
            if (Array.isArray(this.sortable)) {
                if (this.sortable.length === 0) {
                    return;
                }

                // We check if the given index is a valid column for sorting
                const elements = this.sortable;
                if (this.header[index] !== elements[index]) {
                    return;
                }
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

            return;
        }

        // Fallback
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
            tableRow.classList.add("row");

            if (this.hover) {
                tableRow.classList.add("hoverable");
            }

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

            // Alternate the colors
            if (this.striped) {
                if (rowIndex % 2 === 0) {
                    tableRow.classList.add("even");
                } else {
                    tableRow.classList.add("odd");
                }
            }
        }
    }

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

    renderDatatableNode(table) {
        const dataTable = document.createElement("div");
        dataTable.className = "datatable-container";
        this.dataTable = dataTable;

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
                if (Array.isArray(this.searchable)) {
                    if (this.searchable.length === 0) {
                        return true;
                    }

                    const objectKeys = Object.keys(data);

                    for (const e of this.searchable) {
                        const index = this.header.indexOf(e);
                        const key = objectKeys[index];
                        const element = data[key]?.toString().toLowerCase();

                        if (element && element.includes(event.target.value.toLowerCase())) {
                            return true;
                        }
                    }

                } else {
                    for (const key in data) {
                        const element = data[key]?.toString().toLowerCase();
                        if (element && element.includes(event.target.value.toLowerCase())) {
                            return true;
                        }
                    }
                }

                return false;
            })
        });

        const inputLabel = document.createElement("label");
        inputLabel.setAttribute("for", id)
        inputLabel.innerHTML = this.searchLabelText;
        inputLabel.appendChild(input);

        container.appendChild(inputLabel);

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
        const pageData = this.getCurrentPageColumnsData();
        const tableBody = document.createElement("tbody");

        for (let rowIndex = 0; rowIndex < pageData.length; rowIndex++) {
            const data = pageData[rowIndex];
            const tr = document.createElement("tr");

            // Number of 'td' inserted in the current row
            let count = 0;
            
            if (data !== null) {
                let colIndex = 0;
                for (const key in data) {
                    const element = data[key];
                    const td = document.createElement("td");
                    td.innerHTML = element ?? "";
                    tr.appendChild(td);

                    this.onTableColumn(td, colIndex);
                    colIndex += 1;
                    count += 1;
                }  
            } 

            // Insert empty cells if the current row length is less than the header
            for (let i = count; i < this.header.length; i++) {
                const td = document.createElement("td");
                this.onTableColumn(td, i);
                tr.appendChild(td);
            }

            if (this.centerText) {
                tr.classList.add("text-center");
            }

            this.onTableRow(tr, rowIndex + 1);
            tableBody.appendChild(tr);
        }

        tableNode.appendChild(tableBody);

        // vertical scroll
        if (this.scrollY) {
            const scrollYContainer = document.createElement("div");
            scrollYContainer.classList.add("table-scroll-y");
            scrollYContainer.style.maxHeight = typeof this.scrollY === "number" ? `${this.scrollY}px` : this.scrollY;
            scrollYContainer.appendChild(tableNode);
            tableNode = scrollYContainer;
        }

        // Horizontal scroll
        if (this.scrollX) {
            const tableScrollContainer = document.createElement("div");
            tableScrollContainer.className = "table-scroll-x";
            tableScrollContainer.appendChild(tableNode);
            tableNode = tableScrollContainer;
        }

        return tableNode;
    }

    toNode() {
        const tableNode = this.renderTableNode();
        return this.renderDatatableNode(tableNode)
    }

    toHtml() {
        return nodeToHtml(this.toNode(), false);
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

function nodeToHtml(node, clone) {
    const tempParent = document.getElementById("div");
    if (clone == null || clone === true) {
        tempParent.appendChild(node.deepClone())
    } else {
        tempParent.appendChild(node)
    }
    return tempParent.innerHTML;
}

function nodeToString(node, clone) {
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