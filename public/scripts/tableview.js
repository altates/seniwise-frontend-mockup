/**
 * TableView is a lightweight, reusable table renderer with API-driven data.
 * It supports search, sorting, and pagination via query parameters.
 * @format
 */

(() => {
	"use strict";

	/**
	 * @typedef {Object} TableViewQueryParamMap
	 * @property {string} page
	 * @property {string} query
	 * @property {string} sortBy
	 * @property {string} sortOrder
	 */

	/**
	 * @typedef {Object} TableViewColumn
	 * @property {string} key
	 * @property {string} label
	 * @property {boolean} sortable
	 * @property {string} sort_key
	 * @property {string=} link_template
	 */

	/**
	 * @typedef {Object} TableViewPagination
	 * @property {number} current
	 * @property {number} total
	 * @property {number} totalItems
	 */

	/**
	 * @typedef {Object} TableViewApiResult
	 * @property {TableViewPagination} pagination
	 * @property {TableViewColumn[]=} columns
	 * @property {Array<Record<string, unknown>>} items
	 * @property {{ query: string, placeholder?: string }=} search
	 * @property {{ by: string, order: "asc" | "desc" }=} sort
	 */

	/**
	 * @typedef {Object} TableViewApiResponse
	 * @property {boolean} success
	 * @property {{ code: number, message: string } | null} error
	 * @property {TableViewApiResult | null} result
	 */

	/**
	 * @typedef {Object} TableViewOptions
	 * @property {string} dataUrl
	 * @property {string=} searchPlaceholder
	 * @property {string=} initialSortBy
	 * @property {"asc" | "desc"=} initialSortOrder
	 * @property {string=} emptyMessage
	 * @property {TableViewQueryParamMap=} queryParamMap
	 */

	/**
	 * TableView is a single-instance renderer bound to a container.
	 */
	class TableView {
		/**
		 * @param {HTMLElement} container
		 * @param {TableViewOptions} options
		 */
		constructor(container, options) {
			this.container = container;
			this.options = {
				dataUrl: options.dataUrl,
				searchPlaceholder: options.searchPlaceholder || "",
				initialSortBy: options.initialSortBy || "",
				initialSortOrder: options.initialSortOrder || "asc",
				emptyMessage: options.emptyMessage || "No results.",
				queryParamMap: options.queryParamMap || {
					page: "p",
					query: "q",
					sortBy: "sort_by",
					sortOrder: "sort_order",
				},
			};
			this.state = {
				page: 0,
				query: "",
				sortBy: this.options.initialSortBy,
				sortOrder: this.options.initialSortOrder,
			};
			this.columns = [];
			this.items = [];
			this.pagination = { current: 0, total: 0, totalItems: 0 };
			this.loading = false;
			this.searchTimeout = null;

			this.root = document.createElement("div");
			this.root.className = "tableview";

			this.searchRow = document.createElement("div");
			this.searchRow.className = "tableview-search";
			this.searchInput = document.createElement("input");
			this.searchInput.type = "search";
			this.searchInput.placeholder = this.options.searchPlaceholder;
			this.searchInput.addEventListener("input", () => {
				if (this.searchTimeout) {
					window.clearTimeout(this.searchTimeout);
				}
				this.searchTimeout = window.setTimeout(() => {
					this.state.query = this.searchInput.value.trim();
					this.state.page = 0;
					this.load();
				}, 250);
			});
			this.searchRow.appendChild(this.searchInput);
			this.root.appendChild(this.searchRow);

			this.table = document.createElement("sui-table");
			this.table.className = "tableview-table";
			this.thead = document.createElement("sui-thead");
			this.tbody = document.createElement("sui-tbody");
			this.table.appendChild(this.thead);
			this.table.appendChild(this.tbody);
			this.root.appendChild(this.table);

			this.paginationRow = document.createElement("div");
			this.paginationRow.className = "tableview-pagination";
			this.prevButton = document.createElement("button");
			this.prevButton.type = "button";
			this.prevButton.textContent = "Previous";
			this.prevButton.addEventListener("click", () => {
				if (this.pagination.current > 0) {
					this.state.page = this.pagination.current - 1;
					this.load();
				}
			});
			this.nextButton = document.createElement("button");
			this.nextButton.type = "button";
			this.nextButton.textContent = "Next";
			this.nextButton.addEventListener("click", () => {
				if (this.pagination.current + 1 < this.pagination.total) {
					this.state.page = this.pagination.current + 1;
					this.load();
				}
			});
			this.pageLabel = document.createElement("span");
			this.pageLabel.className = "tableview-page-label";
			this.paginationRow.appendChild(this.prevButton);
			this.paginationRow.appendChild(this.pageLabel);
			this.paginationRow.appendChild(this.nextButton);
			this.root.appendChild(this.paginationRow);

			this.container.innerHTML = "";
			this.container.appendChild(this.root);
			this.load();
		}

		/**
		 * Fetch data from the API and render the table.
		 * @returns {Promise<void>}
		 */
		async load() {
			this.loading = true;
			this.render();
			const url = new URL(this.options.dataUrl, window.location.origin);
			const params = this.options.queryParamMap;
			url.searchParams.set(params.page, String(this.state.page));
			if (this.state.query) {
				url.searchParams.set(params.query, this.state.query);
			} else {
				url.searchParams.delete(params.query);
			}
			if (this.state.sortBy) {
				url.searchParams.set(params.sortBy, this.state.sortBy);
				url.searchParams.set(params.sortOrder, this.state.sortOrder);
			} else {
				url.searchParams.delete(params.sortBy);
				url.searchParams.delete(params.sortOrder);
			}

			try {
				const response = await fetch(url.toString(), {
					headers: { Accept: "application/json" },
				});
				if (!response.ok) {
					throw new Error(`Request failed: ${response.status}`);
				}
				/** @type {TableViewApiResponse} */
				const payload = await response.json();
				if (!payload || payload.success !== true || !payload.result) {
					throw new Error("Invalid API response");
				}

				if (Array.isArray(payload.result.columns)) {
					this.columns = payload.result.columns;
				}
				if (payload.result.search && typeof payload.result.search.placeholder === "string") {
					if (!this.options.searchPlaceholder) {
						this.searchInput.placeholder = payload.result.search.placeholder;
					}
				}
				if (payload.result.sort) {
					this.state.sortBy = payload.result.sort.by;
					this.state.sortOrder = payload.result.sort.order;
				}
				this.items = payload.result.items || [];
				this.pagination = payload.result.pagination || { current: 0, total: 0, totalItems: 0 };
				this.loading = false;
				this.render();
			} catch (error) {
				this.loading = false;
				this.items = [];
				this.pagination = { current: 0, total: 0, totalItems: 0 };
				this.render(String(error));
			}
		}

		/**
		 * Render the table and pagination controls.
		 * @param {string=} errorMessage
		 * @returns {void}
		 */
		render(errorMessage) {
			this.thead.innerHTML = "";
			this.tbody.innerHTML = "";

			if (!this.columns.length) {
				return;
			}

			const headerRow = document.createElement("sui-tr");
			this.columns.forEach((column) => {
				const headerCell = document.createElement("sui-th");
				if (column.sortable) {
					const sortButton = document.createElement("button");
					sortButton.type = "button";
					sortButton.className = "tableview-sort";
					sortButton.textContent = column.label;
					if (this.state.sortBy === column.sort_key) {
						sortButton.classList.add(
							this.state.sortOrder === "desc" ? "is-desc" : "is-asc"
						);
					}
					sortButton.addEventListener("click", () => {
						if (this.state.sortBy === column.sort_key) {
							this.state.sortOrder = this.state.sortOrder === "asc" ? "desc" : "asc";
						} else {
							this.state.sortBy = column.sort_key;
							this.state.sortOrder = "asc";
						}
						this.state.page = 0;
						this.load();
					});
					headerCell.appendChild(sortButton);
				} else {
					headerCell.textContent = column.label;
				}
				headerRow.appendChild(headerCell);
			});
			this.thead.appendChild(headerRow);

			let message = "";
			if (this.loading) {
				message = "Loading...";
			} else if (errorMessage) {
				message = errorMessage;
			} else if (!this.items.length) {
				message = this.options.emptyMessage;
			}

			if (message) {
				const messageRow = document.createElement("sui-tr");
				this.columns.forEach((column, index) => {
					const messageCell = document.createElement("sui-td");
					if (index === 0) {
						messageCell.textContent = message;
						messageCell.className = "tableview-message";
					} else {
						messageCell.textContent = "";
					}
					messageRow.appendChild(messageCell);
				});
				this.tbody.appendChild(messageRow);
			} else {
				this.items.forEach((row) => {
					const bodyRow = document.createElement("sui-tr");
					this.columns.forEach((column) => {
						const bodyCell = document.createElement("sui-td");
						const value = row[column.key];
						const textValue =
							value === null || value === undefined ? "" : String(value);

						if (column.link_template) {
							const link = document.createElement("a");
							link.textContent = textValue;
							link.href = column.link_template.replace(
								/\{([^}]+)\}/g,
								(match, key) => String(row[key] || "")
							);
							bodyCell.appendChild(link);
						} else {
							bodyCell.textContent = textValue;
						}
						bodyRow.appendChild(bodyCell);
					});
					this.tbody.appendChild(bodyRow);
				});
			}

			const totalPages = this.pagination.total || 0;
			const currentPage = this.pagination.current || 0;
			const pageLabel = totalPages
				? `Page ${currentPage + 1} of ${totalPages}`
				: "Page 0 of 0";
			this.pageLabel.textContent = pageLabel;
			this.prevButton.disabled = currentPage <= 0;
			this.nextButton.disabled = currentPage + 1 >= totalPages;
		}
	}

	window.TableView = TableView;
})();
