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
    constructor(options) {
        if (options == null) {
            throw new Error("DataTable `options` cannot be null");
        }

        // Table data
        this.header = options.header;
        this.data = options.data ?? [];

        if (this.header == null){
            if (this.data == null || this.data.length === 0){
                throw new Error("A 'header' must be provided if the data is empty");
            }

            this.header = Object.keys(this.data[0]);
        }

        // Table options
        this.currentPage = options.currentPage ?? 0;
        this.paginate = options.paginate ?? true;
        this.minRows = options.minRows ?? 0;
        this.maxRows = options.maxRows ?? Number.MAX_SAFE_INTEGER;
        this.previousButtonText = options.previousButtonText ?? "«";
        this.nextButtonText = options.nextButtonText ?? "»";
        this.pageButtonCount = options.pageButtonCount ?? 10;
        this.hover = options.hover?? true;
        this.centerText = options.centerText?? false;
        this.scrollX = options.scrollX?? false;
        this.scrollY = options.scrollY;
        this.striped = options.striped?? true;
        this.sortable = options.sortable?? true;
        this.searchable = options.searchable?? true;
        this.searchLabelText = options.searchLabelText?? "Search: ";

        if (options.columnSelection == null && this.sortable != null) {
            this.columnSelection = true;
        }

        // Assertions
        for (const key in options) {
            if (!this.hasOwnProperty(key)) {
                throw new Error(`Unexpected property '${key}' for DataTable`);
            }
        }

        console.assert(this.minRows <= this.maxRows, "minRows must be lower of equals to maxRows");
        console.assert(this.isValidPage(this.currentPage), `invalid 'currentPage' ${this.currentPage} max is ${this.pageCount()}`);
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

    getCurrentPageData() {
        const startIndex = this.currentPage * this.maxRows;
        const endIndex = Math.min(startIndex + this.maxRows, this.data.length);
        let pageData = this.data.slice(startIndex, endIndex);

        if (this.sorting) {
            pageData = pageData.sort((objA, objB) => {
                const index = this.sorting.index;
                const x = objA[Object.keys(objA)[index]]
                const y = objB[Object.keys(objB)[index]]
                return this.sorting.sortBy === SORT_ASC? compare(x, y) : compare(y, x);
            });
        }

        if (this.search && this.search.length > 0) {
            pageData = pageData.filter(obj => {
                for (const key in obj) {
                    if (Object.hasOwnProperty.call(obj, key)) {
                        const element = obj[key]?.toString();
                        if (element && element.includes(this.search)) {
                            return true;
                        }
                    }
                }

                return false;
            })
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

    sortColumn(column, index) {
        if (Array.isArray(this.sortable)) {
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

            if (sorting.index !== index){
                sorting.sortBy = SORT_ASC;
            } else {
                sorting.sortBy = sorting.sortBy === SORT_ASC ? SORT_DESC : SORT_ASC;
            }

            sorting.column = column;
            sorting.index = index;
        }
        
        column.classList.add(this.sorting.sortBy);
        this.render();
    }

    selectColumn(index) {
        const temp = this.selectColumn;
        this.selectedColumn = index;
        this.prevSelectedColumn = temp;
        this.render();
    }

    onTableColumn(tableCell, columnIndex) {
        if (this.columnSelection) {
            if (this.prevSelectedColumn === columnIndex) {
                tableCell.classList.remove("selected-column");
            }
    
            if(this.selectedColumn === columnIndex) {
                tableCell.classList.add("selected-column");
            }
        }
    }

    onTableRow(tableRow, rowIndex) {
        if (rowIndex > 0) {
            tableRow.classList.add("row");

            if (this.hover) {
                tableRow.classList.add("hoverable");
            }

            // Alternate the colors
            if (this.striped) {
                if (rowIndex % 2 === 0) {
                    tableRow.classList.add("row-even");
                } else {
                    tableRow.classList.add("row-odd");
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

        tableContainer.replaceChild(this.createTableNode(), tableContainer.firstChild);
        paginatorContainer.replaceChild(this.createPaginatorNode(), paginatorContainer.firstChild);
    }

    createPage(table) {
        const dataTable = document.createElement("div");
        dataTable.className = "datatable";
        this.dataTable = dataTable;

        if (this.searchable) {
            const searchContainer = document.createElement("div");
            searchContainer.className = "searchbar-container";
            searchContainer.appendChild(this.createSearchBar());
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
            paginatorContainer.appendChild(this.createPaginatorNode());
            dataTable.appendChild(paginatorContainer);
        } else {
            dataTable.appendChild(table);
        }

        return dataTable;
    }

    createSearchBar() {
        const container = document.createElement("div");
        container.className = "searchbar";

        const id = getNextID("searchbar-input");
        const input = document.createElement("input");
        input.setAttribute("id", id)
        input.addEventListener("input", (e) => {
            this.search = e.target.value;
            this.render();
        });

        const inputLabel = document.createElement("label");
        inputLabel.setAttribute("for", id)
        inputLabel.innerHTML = this.searchLabelText;
        inputLabel.appendChild(input);

        container.appendChild(inputLabel);

        return container;
    }

    createPaginatorNode() {
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

    createTableNode() {
        let tableNode = document.createElement("table");

        // Creates the table header
        const tableHeader = document.createElement("thead");
        const tableHeaderRow = document.createElement("tr");

        for (let i = 0; i < this.header.length; i++) {
            const element = this.header[i];
            const th = document.createElement("th");
            th.innerHTML = element?? "";

            if (this.centerText) {
                th.classList.add("text-center");
            }

            if (this.sortable) {
                th.classList.add("sortable");
                
                if (this.sorting && this.sorting.index === i) {
                    th.classList.add(this.sorting.sortBy);
                }
                th.addEventListener("click", this.sortColumn.bind(this, th, i));
            }

            if (this.columnSelection) {
                th.addEventListener("click", this.selectColumn.bind(this, i));
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

            if (data !== null) {
                let colIndex = 0;
                for (const key in data) {
                    if (Object.hasOwnProperty.call(data, key)) {
                        const element = data[key];
                        const td = document.createElement("td");
                        td.innerHTML = element?? "";
                        tr.appendChild(td);
                        
                        this.onTableColumn(td, colIndex);
                        colIndex += 1;
                    }
                }
            } else {
                for (let i = 0; i < this.header.length; i++) {
                    const td = document.createElement("td");
                    this.onTableColumn(td, i);
                    tr.appendChild(td);
                }
            }

            if (this.centerText) {
                tr.classList.add("text-center");
            }

            // Check if the current element fit the table, if not expand it
            if (data != null) {
                const currentDataCols = Object.keys(data).filter(k => typeof data[k] !== "function").length;
                if (currentDataCols !== this.header.length && currentDataCols < this.header.length) {
                    const requiredColumns = this.header.length - currentDataCols + 1;
                    tr.lastChild.setAttribute("colspan", requiredColumns);  
                }
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
        const tableNode = this.createTableNode();
        return this.createPage(tableNode)
    }

    toHtml() {
        return nodeToHtml(this.toNode(), false);
    }
}

function createDatatable(element, options) {
    console.assert(element, "`element` cannot be null");

    const root = typeof element === "string" ? document.querySelector(element) : element;

    if (root === null) {
        throw new Error(`Cannot find ${element}`);
    }

    const dataTable = new DataTable(options);
    root.appendChild(dataTable.toNode());
}

/* Utilities */
function compare(x, y) {
    if (Object.is(x, y)) {
        return 0;
    }

    if (x > y){
        return 1;
    } else if(x < y){
        return -1;
    } else {
        return 0;
    }
}

function nodeToHtml(node, clone) {
    const tempParent = document.getElementById("div");
    if(clone == null || clone === true) {
        tempParent.appendChild(node.deepClone())
    } else {
        tempParent.appendChild(node)
    }
    return tempParent.innerHTML;
}

function nodeToString(node, clone) {
    const tempParent = document.getElementById("div");
    if(clone == null || clone === true) {
        tempParent.appendChild(node.deepClone())
    } else {
        tempParent.appendChild(node)
    }
    return tempParent.innerText;
}

// Unique ID generator
const getNextID = (() => {
    let id = 0;
    return function(name) {
        if (name) {
            return `${name}-${id++}`;
        } else {
            return id++;
        }
    }
})();