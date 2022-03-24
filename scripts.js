const Modal = {
    open(){
        // Abrir Modal
        // Adicionar a classe active ao modal
        document.querySelector('.modal-overlay').classList.add('active')

    },
    close(){
        // Fechar o modal
        // Remover a class active do modal
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
// Criar uma variavel
        let income = 0;
// Pegar todas as transações
        Transaction.all.forEach(transaction => {
// Se for maior que zero
            if( transaction.amount > 0 ) {
// Somar a variável
                income += transaction.amount //income = income + transaction.amount
            }
        })
// E Retornar a variável
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if( transaction.amount < 0 ) {
                expense += transaction.amount //expense = expense + transaction.amount
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
        console.log(date)
    },

    formatCurrency(value) {
        // Transformando o valor em um numero e colocando sinal de "-" se for Menor que zero
        const signal = Number(value) < 0 ? "-" : ""
        // Transformando um numero em uma string e pegando todo caracter especial (no caso o "-") e substituindo por " " (Ou seja, nada)
        value = String(value).replace(/\D/g, "")
        // Transformando a string em numero novamente e dividindo por 100 (para ficar decimal)
        value = Number(value) / 100
        // Colocando o R$ na frente do numero
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }

}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()
        if( description.trim() === "" ||
            amount.trim() === "" || 
            date.trim() === "" ) {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        // verificar se todas as informações foram preenchidas
        try {
            Form.validateFields()
        // formatar os dados para salvar
            const transaction = Form.formatValues()
        // Salvar
            Form.saveTransaction(transaction)
        // Apagar os dados do formulário
            Form.clearFields()
        // Modal Feche
            Modal.close()
        // Atualizar a aplicação -- Já temos o App.reload() no "Transaction > add" que está no "Form.saveTransiction()" 

    } catch (error) {
        alert(error.message)
    }
    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        }) // Atalho: "Transaction.all.forEach(DOM.addTransaction)"

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    
    reload() {
        DOM.clearTransactions()
        App.init()
    },
} 

App.init()
