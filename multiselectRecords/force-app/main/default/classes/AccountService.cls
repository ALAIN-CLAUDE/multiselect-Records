public with sharing class AccountService {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAllAccounts() {
        try {
            String soql = 'SELECT Id, Name, AccountNumber FROM Account';
            return Database.query(soql);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}