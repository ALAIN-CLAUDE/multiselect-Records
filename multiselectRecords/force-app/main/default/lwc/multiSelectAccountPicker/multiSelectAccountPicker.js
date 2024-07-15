import { LightningElement, api, wire, track } from 'lwc';
import getAllAccounts from '@salesforce/apex/AccountService.getAllAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MultiSelectAccountPicker extends LightningElement {
    @track recordsList = [];
    @track selectedAccounts = [];
    @track selectedItems = [];
    @api recordId;
    error;

    // Record Picker
    recordPickerDisplayInfo = {
        primaryField: 'Name',
        additionalFields: ['AccountNumber']
    };
    recordPickerMatchingInfo = {
        primaryField: { fieldPath: 'Name' },
        additionalFields: [{ fieldPath: 'AccountNumber' }]
    };

    handleChange(evt) {
        let recordId = evt.detail.recordId;
        this.selectedItems = [];
        const selectedItem = this.recordsList.find(item => item.recordId === recordId);
        const alreadyExists = this.selectedAccounts.some(item => item.recordId === selectedItem.recordId);
        if (!alreadyExists) {
            this.template.querySelector('lightning-record-picker').clearSelection();
            this.selectedItems.push(selectedItem);
            this.selectedAccounts.push({
                label: selectedItem.label,
                value: selectedItem.value,
                recordId: selectedItem.recordId,
                icon: selectedItem.icon
            });
            this.recordsList = this.recordsList.filter(item => item.recordId !== recordId);
        }
    }

    @wire(getAllAccounts)
    wiredGetAccounts({ error, data }) {
        if (data) {
            if (data.length > 0) {
                this.recordsList = data.map(account => ({
                    label: account.Name,
                    value: account.Id,
                    recordId: account.Id,
                    description: account.AccountNumber,
                    icon: 'standard:account',
                    variant: 'success'
                }));
            }
        } else if (error) {
            this.error = error;
            this.showToast('Error', 'An error occurred while searching: ' + error.body.message, 'error');
        }
    }

    handleRemoveRecord(event) {
        const removeItem = event.detail.name;
        const removedItemIndex = this.selectedAccounts.findIndex(item => item.value === removeItem);
        const removedItem = this.selectedAccounts.splice(removedItemIndex, 1)[0];
        this.recordsList.push({
            label: removedItem.label,
            value: removedItem.value,
            recordId: removedItem.recordId,
            icon: removedItem.icon
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}