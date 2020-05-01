
// Budget Controller
var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome){
		if(totalIncome > 0 ){
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}	
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach((current) => {
			sum += current.value;
		});

		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItem: function(type, description, value) {
			var newItem, ID;

			// Create new ID
			if(data.allItems[type].length > 0 ) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}	
			
			// Create new item based on 'inc' or 'exp' type
			if(type === 'exp') {
				newItem = new Expense(ID, description, value);
			} else if(type === 'inc') {
				newItem = new Income(ID, description, value);
			}
			
			// push item into data structure
			data.allItems[type].push(newItem);
			return newItem;
			
		},
		
		deleteItem:  function(type, id) {
			var ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			var index = ids.indexOf(id);
			if(index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			calculateTotal('exp');
			calculateTotal('inc');
			data.budget = data.totals.inc - data.totals.exp;
			data.percentage = (data.totals.inc > 0) ? Math.round((data.totals.exp / data.totals.inc) * 100) + '%' : -1;

		},
		
		calculatePercentage: function() {
			data.allItems.exp.forEach(function(current) {
				current.calcPercentage(data.totals.inc);
			});
		},

		getPercentage: function() {
			var allPerc = data.allItems.exp.map(function(current) {
				return current.getPercentage();
			});
			return allPerc;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalsInc: data.totals.inc,
				totalsExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		testing: function() {
			console.log(data);
		}
	}

})();


// UI Controller
var UIController = (function() {
	
	var DomStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensePercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'

	}

	var formatNumber = function(num, type) {
		/**
		 * + or - before number
		 * exactly 2 decimal points comma separating the thousands
		 * 2310.4567 -> 2,310.46
		 * 2000 -> 2,000.00
		 */
		var numSplit, int, dec;
		 num = Math.abs(num);
		 num = num.toFixed(2);
		 numSplit = num.split('.');

		 int  = numSplit[0];
		 if(int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
		 }

		 dec = numSplit[1];

		 return (type === 'exp' ? '-' : '+')  +  ' ' + int + '.' +  dec;
	};

	var nodeListForEach = function(list, callback) {
		for (let i = 0; i < list.length; i++) {
			callback(list[i], i); /** this is the function defined below */	
		}
	};

	return {
		getInput: function() {
			return {
				type: document.querySelector(DomStrings.inputType).value, // will be either inc or exp
				description: document.querySelector(DomStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DomStrings.inputValue).value)
			}
		},

		addListItem: function(obj, type) {
			var html, newHtml;
			
			if(type === 'inc') {
				element = DomStrings.incomeContainer
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';		
			} else if(type === 'exp') {

				element = DomStrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		
		displayBudget: function(obj) {
			var type = obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalsInc, 'inc');
			document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.totalsExp, 'exp');
			
			if(obj.percentage > 0) {
				document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage;
			} else {
				document.querySelector(DomStrings.percentageLabel).textContent = '---';
			}
		},

		getDomStrings: function() {
			return DomStrings;
		},

		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		displayPercentages: function(percentages) {
			var fields;
			fields = document.querySelectorAll(DomStrings.expensePercLabel);
			
			nodeListForEach(fields, 
				function(current, index) 
				/** this function here is 
				 * callback function that is defined above */ 
			{
				current.textContent = (percentages[index] > 0 ) ? percentages[index] + '%' : '---';
			});

		},

		clearFields: function() {
			var fields = document.querySelectorAll(DomStrings.inputDescription + ',' +  DomStrings.inputValue)
			var fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach((currentField, index)=> {
				currentField.value = "";
			});

			fieldsArr[0].focus();
		},

		displayMonth: function() {
			var now, day, month, year;
			now = new Date();
			day = now.getDay();
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DomStrings.dateLabel).textContent = day + '/' + month + '/'+ year;	
		},

		changedType: function() {
			var fields;
			fields = document.querySelectorAll(
						DomStrings.inputType + ',' +
						DomStrings.inputDescription + ',' +
						DomStrings.inputValue 
					);
			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});	
			
			document.querySelector(DomStrings.inputBtn).classList.toggle('red');
		}
	};

})();


// Global App Controller
var controller = (function(budgetCtrl, UICtrl) {
	
	var setupEventsListeners = function() {
		
		var domString = UICtrl.getDomStrings();

		document.querySelector(domString.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			
			if(event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(domString.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(domString.inputType).addEventListener('change', UICtrl.changedType);
	};

	var updateBudget = function() {
		budgetCtrl.calculateBudget();
		let budget = budgetCtrl.getBudget();
		UICtrl.displayBudget(budget);
	};

	var updatePercentage = function() {
		budgetCtrl.calculatePercentage();
		var percentages = budgetCtrl.getPercentage();
		UICtrl.displayPercentages(percentages);
	};
	
	var ctrlAddItem = function() {
		var input, newItem;
		input = UICtrl.getInput();
		if(input.description !== "" 
			&& !isNaN(input.value) 
			&& input.value > 0) {
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			UICtrl.addListItem(newItem, input.type);
			UICtrl.clearFields();
			updateBudget();
			updatePercentage();
		} 
	}

	var ctrlDeleteItem = function(event) {
		var itemID,splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			budgetCtrl.deleteItem(type, ID);
			UICtrl.deleteListItem(itemID);
			updateBudget();
			updatePercentage();
		}
	};

	return {
		init: function() {
			console.log('Application has started');
			UICtrl.displayMonth();
			UICtrl.displayBudget( {
				budget: 0,
				totalsInc: 0,
				totalsExp: 0,
				percentage: 0
			});
			setupEventsListeners();
		}
	}


})(budgetController,UIController);

controller.init();