var ResClient = resclient.default;

// Book component
var Book = Vue.component('book', {
	template: "#book-template",
	components: {
		'book': Book
	},
	props: [ 'books', 'book' ],
	data() {
		return {
			isEdit: false,
			editTitle: "",
			editAuthor: "",
		};
	},
	created() {
		this.book.on('change', this.onUpdate);
	},
	beforeDestroy() {
		this.book.off('change', this.onUpdate);
	},
	methods: {
		handleEdit() {
			this.isEdit = true;
			this.editTitle = this.book.title;
			this.editAuthor = this.book.author;
		},
		handleDelete() {
			this.books.call('delete', {
				id: this.book.id
			}).catch(this.showError);
		},
		handleOk() {
			this.book.set({
				title: this.editTitle,
				author: this.editAuthor
			}).then(() => {
				this.isEdit = false;
			}).catch(this.showError);
		},
		handleCancel() {
			this.isEdit = false;
		},
		onUpdate() {
			this.$forceUpdate();
		},
		showError(err) {
			this.$emit('error', err);
		}
	}
});

// BookList component
var BookList = Vue.component('book-list', {
	template: "#book-list-template",
	components: {
		'book': Book
	},
	props: [ 'books' ],
	created() {
		this.books.on('add', this.onUpdate);
		this.books.on('remove', this.onUpdate);
	},
	beforeDestroy() {
		this.books.off('add', this.onUpdate);
		this.books.off('remove', this.onUpdate);
	},
	methods: {
		onUpdate() {
			this.$forceUpdate();
		},
		showError(err) {
			this.$emit('error', err);
		}
	}
});

// App component
new Vue({
	el: '#app',
	components: {
		'book-list': BookList
	},
	data: {
		books: null,
		newTitle: "",
		newAuthor: "",
		errMsg: "",
		errTimer: null
	},
	created() {
		this.client = new ResClient('ws://localhost:8080');

		this.client.get('library.books').then(books => {
			this.books = books;
		}).catch(this.showError);
	},
	methods: {
		handleAddNew() {
			this.client.call('library.books', 'new', {
				title: this.newTitle,
				author: this.newAuthor
			}).then(() => {
				this.newTitle = "";
				this.newAuthor = "";
			}).catch(this.showError);
		},
		showError(err) {
			this.errMsg = err && err.code && err.code == 'system.connectionError'
				? "Connection error. Are NATS Server and Resgate running?"
				: err && err.message ? err.message : String(err);
			clearTimeout(this.errTimer);
			this.errTimer = setTimeout(() => this.errMsg = "", 7000);
		}
	}
});
