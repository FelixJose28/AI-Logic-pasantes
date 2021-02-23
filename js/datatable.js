"use strict";

class DataTable {
    constructor(options) {
        if (options == null) {
            throw new Error("DataTable `options` cannot be null");
        }

        // Table data
        this.header = options.header;
        this.data = options.data ?? [];

        // Table options
        this.currentPage = options.currentPage ?? 0;
        this.paginate = options.paginate ?? true;
        this.minRows = options.minRows ?? 0;
        this.maxRows = options.maxRows ?? Number.MAX_VALUE;
        this.previousButtonText = options.previousButtonText ?? "«";
        this.nextButtonText = options.nextButtonText ?? "»";
        this.pageButtonCount = options.pageButtonCount ?? 10;
        this.scrollX = options.scrollX;
        this.scrollY = options.scrollY;
        this.sorteable = options.sorteable;

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
        console.log("NEXT");
    }

    prevPage() {
        this.moveToPage(this.currentPage - 1);
        console.log("PREV");
    }

    getCurrentPageData() {
        const startIndex = this.currentPage * this.maxRows;
        const endIndex = Math.min(startIndex + this.maxRows, this.data.length);
        let pageData = this.data.slice(startIndex, endIndex);


        if (this.sorting) {
            switch (this.sorting.sortBy) {
                case "asc":
                    pageData = pageData.sort((objA, objB) => {
                        const index = this.sorting.index;
                        const x = objA[Object.keys(objA)[index]]
                        const y = objB[Object.keys(objB)[index]]
                        console.log(`${x} and ${y} == ${sortByAscending(x, y)}`);
                        return sortByAscending(x, y);
                    });
                    break;
                case "desc":
                    pageData = pageData.sort((objA, objB) => {
                        const index = this.sorting.index;
                        const x = objA[Object.keys(objA)[index]]
                        const y = objB[Object.keys(objB)[index]]
                        console.log(`${x} and ${y} == ${sortByDecensing(x, y)}`);
                        return sortByDecensing(x, y);
                    });
                    break;
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

    sortColumn(column, index) {
        const sorting = this.sorting;
        if (sorting == null) {
            column.classList.add("asc");

            this.sorting = {
                index: index,
                column: column,
                sortBy: "asc"
            };

        } else {
            sorting.index = index;

            sorting.column.classList.remove(sorting.sortBy);
            sorting.sortBy = sorting.sortBy === "asc" ? "desc" : "asc";
            sorting.column = column;

            column.classList.add(sorting.sortBy);
        }

        this.render();
    }

    // This is only called if there is a paginator, otherwise the table is static
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

        if (this.paginate) {
            const tableContainer = document.createElement("div");
            tableContainer.className = "table-container";
            tableContainer.appendChild(table);
            dataTable.appendChild(tableContainer);

            const paginatorContainer = document.createElement("div");
            paginatorContainer.className = "paginator-container";
            paginatorContainer.appendChild(this.createPaginatorNode());
            dataTable.appendChild(paginatorContainer);
        } else {
            dataTable.appendChild(table);
        }

        return dataTable;
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
        const tableNode = document.createElement("table");

        // Creates the table header
        const tableHeader = document.createElement("thead");
        const tableHeaderRow = document.createElement("tr");

        for (let i = 0; i < this.header.length; i++) {
            const element = this.header[i];
            const th = document.createElement("th");
            th.innerText = element;

            if (this.sorteable) {
                th.classList.add("sortable");
                th.addEventListener("click", this.sortColumn.bind(this, th, i));
            }

            tableHeaderRow.appendChild(th);
        }

        // Set vertical scroll
        if (this.scrollY) {
            tableHeaderRow.classList.add("table-scroll-y");
        }

        tableHeader.appendChild(tableHeaderRow);
        tableNode.appendChild(tableHeader);

        // Creates the table rows
        let index = 0;
        const tableBody = document.createElement("tbody");
        for (const data of this.getCurrentPageData()) {
            const tr = document.createElement("tr");

            if (data !== null) {
                for (const key in data) {
                    if (Object.hasOwnProperty.call(data, key)) {
                        const element = data[key];
                        const td = document.createElement("td");
                        td.innerText = element;

                        tr.appendChild(td);
                    }
                }
            } else {
                for (let i = 0; i < this.header.length; i++) {
                    tr.appendChild(document.createElement("td"));
                }
            }

            tr.classList.add("row");
            if (index % 2 === 0) {
                tr.classList.add("row-even");
            } else {
                tr.classList.add("row-odd");
            }

            tableBody.appendChild(tr);
            index += 1;
        }

        // Set vertical scroll
        if (this.scrollY) {
            this.tableBody.style.minHeight = typeof this.scrollY === "number" ? `${this.scrollY}px` : this.scrollY;
        }

        tableNode.appendChild(tableBody);

        if (this.scrollX) {
            const tableScrollContainer = document.createElement("div");
            tableScrollContainer.className = "table-scroll-x";
            tableScrollContainer.style.overflowX = "auto";
            tableScrollContainer.appendChild(tableNode);
            return tableScrollContainer;
        }

        return tableNode;
    }

    toNode() {
        const tableNode = this.createTableNode();
        return this.createPage(tableNode)
    }

    toHtml() {
        const temp = document.createElement("div");
        temp.appendChild(this.toNode())
        return temp.innerHTML;
    }
}

function createDatatable(element, options) {
    console.assert(element, "`element` cannot be null");

    const root = typeof element === "string" ? document.getElementById(element) : element;

    if (root === null) {
        throw new Error(`Cannot find ${element}`);
    }

    const dataTable = new DataTable(options);
    root.appendChild(dataTable.toNode());
}

/* Utilities */
function sortByAscending(x, y) {
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

function sortByDecensing(x, y) {
    return -sortByAscending(x, y);
}