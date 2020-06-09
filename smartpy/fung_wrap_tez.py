# Fungible Assets - FA12
# Inspired by https://gitlab.com/tzip/tzip/blob/master/A/FA1.2.md

import smartpy as sp

class FA12(sp.Contract):
    def __init__(self, admin,start):
        self.init(paused = False, 
        balances = sp.big_map(),
        administrator = admin, 
        totalSupply = 0,
        startLock = start.add_days(30),
        endLock = start.add_days(730)
        )

    @sp.entry_point
    def transfer(self, params):
        sp.verify((sp.sender == self.data.administrator) |
            (~self.data.paused &
                ((params.f == sp.sender) |
                 (self.data.balances[params.f].approvals[sp.sender] >= params.amount))))
        self.addAddressIfNecessary(params.t)
        sp.verify(self.data.balances[params.f].balance >= params.amount)
        self.data.balances[params.f].balance -= params.amount
        self.data.balances[params.t].balance += params.amount
        sp.if (params.f != sp.sender) & (self.data.administrator != sp.sender):
            self.data.balances[params.f].approvals[sp.sender] -= params.amount

    @sp.entry_point
    def approve(self, params):
        sp.verify((sp.sender == self.data.administrator) |
                  (~self.data.paused & (params.f == sp.sender)))
        alreadyApproved = self.data.balances[params.f].approvals.get(params.t, 0)
        sp.verify((alreadyApproved == 0) | (params.amount == 0))
        self.data.balances[params.f].approvals[params.t] = params.amount

    @sp.entry_point
    def setPause(self, params):
        sp.verify(sp.sender == self.data.administrator)
        self.data.paused = params

    @sp.entry_point
    def setAdministrator(self, params):
        sp.verify(sp.sender == self.data.administrator)
        self.data.administrator = params

    @sp.entry_point
    def mint(self, params):
        sp.verify(sp.sender == self.data.administrator)
        self.addAddressIfNecessary(params.address)
        self.data.balances[params.address].balance += params.amount
        self.data.totalSupply += params.amount

    @sp.entry_point
    def burn(self, params):
        sp.verify(sp.sender == self.data.administrator)
        sp.verify(self.data.balances[params.address].balance >= params.amount)
        self.data.balances[params.address].balance -= params.amount
        self.data.totalSupply -= params.amount

    def addAddressIfNecessary(self, address):
        sp.if ~ self.data.balances.contains(address):
            self.data.balances[address] = sp.record(balance = 0, approvals = {})

    @sp.entry_point
    def getBalance(self, params):
        sp.transfer(sp.as_nat(self.data.balances[params.arg.owner].balance), sp.tez(0), sp.contract(sp.TNat, params.target).open_some())

    @sp.entry_point
    def getAllowance(self, params):
        sp.transfer(sp.as_nat(self.data.balances[params.arg.owner].approvals[params.arg.spender]), sp.tez(0), sp.contract(sp.TNat, params.target).open_some())

    @sp.entry_point
    def getTotalSupply(self, params):
        sp.transfer(sp.as_nat(self.data.totalSupply), sp.tez(0), sp.contract(sp.TNat, params.target).open_some())

    @sp.entry_point
    def getAdministrator(self, params):
        sp.transfer(self.data.administrator, sp.tez(0), sp.contract(sp.TAddress, params.target).open_some())
        
    @sp.entry_point
    def wrapTezos(self, params):
        
        sp.verify(sp.now < self.data.startLock)
        
        mintAmount = sp.split_tokens(sp.amount, 105, 100)
        
        
        coins = sp.ediv(mintAmount, sp.mutez(1) ) 
        sp.if ( coins.is_some() ):
            intCoins = sp.to_int( sp.fst(coins.open_some()) ) 
            self.addAddressIfNecessary(sp.sender)
            self.data.balances[sp.sender].balance += intCoins
            self.data.totalSupply += intCoins
        
    @sp.entry_point
    def redeemTezos(self, params):
        
        amount = params.amount
        self.addAddressIfNecessary(sp.sender)
        sp.verify(amount <= self.data.balances[sp.sender].balance)
        sp.verify(sp.now > self.data.endLock)
        
        self.data.balances[sp.sender].balance -= amount
        self.data.totalSupply -= amount
        
        
        sp.send( sp.sender, sp.mutez( sp.as_nat(amount) ))
        
    @sp.entry_point
    def setBaker(self, baker):
        sp.verify(sp.sender == self.data.administrator)
        sp.verify(sp.amount == sp.mutez(0))
        sp.set_delegate(baker)
        

if "templates" not in __name__:
    @sp.add_test(name = "FA12")
    def test():

        scenario = sp.test_scenario()
        scenario.h1("Simple FA12 Contract")

        # sp.test_account generates ED25519 key-pairs deterministically:
        admin = sp.test_account("Administrator")
        alice = sp.test_account("Alice")
        bob   = sp.test_account("Robert")

        # Let's display the accounts:
        scenario.h2("Accounts")
        scenario.show([admin, alice, bob])

        c1 = FA12(admin.address, sp.timestamp(0) )

        scenario += c1
        scenario.h2("Admin mints a few coins")
        scenario += c1.mint(address = alice.address, amount = 12).run(sender = admin)
        scenario += c1.mint(address = alice.address, amount = 3).run(sender = admin)
        scenario += c1.mint(address = alice.address, amount = 3).run(sender = admin)
        scenario.h2("Alice transfers to Bob")
        scenario += c1.transfer(f = alice.address, t = bob.address, amount = 4).run(sender = alice)
        scenario.verify(c1.data.balances[alice.address].balance == 14)
        scenario.h2("Bob tries to transfer from Alice but he doesn't have her approval")
        scenario += c1.transfer(f = alice.address, t = bob.address, amount = 4).run(sender = bob, valid = False)
        scenario.h2("Alice approves Bob and Bob transfers")
        scenario += c1.approve(f = alice.address, t = bob.address, amount = 5).run(sender = alice)
        scenario += c1.transfer(f = alice.address, t = bob.address, amount = 4).run(sender = bob)
        scenario.h2("Bob tries to over-transfer from Alice")
        scenario += c1.transfer(f = alice.address, t = bob.address, amount = 4).run(sender = bob, valid = False)
        scenario.h2("Admin burns Bob token")
        scenario += c1.burn(address = bob.address, amount = 1).run(sender = admin)
        scenario.verify(c1.data.balances[alice.address].balance == 10)
        scenario.h2("Alice tries to burn Bob token")
        scenario += c1.burn(address = bob.address, amount = 1).run(sender = alice, valid = False)
        scenario.h2("Admin pauses the contract and Alice cannot transfer anymore")
        scenario += c1.setPause(True).run(sender = admin)
        scenario += c1.transfer(f = alice.address, t = bob.address, amount = 4).run(sender = alice, valid = False)
        scenario.verify(c1.data.balances[alice.address].balance == 10)
        scenario.h2("Admin transfers while on pause")
        scenario += c1.transfer(f = alice.address, t = bob.address, amount = 1).run(sender = admin)
        scenario.h2("Admin unpauses the contract and transferts are allowed")
        scenario += c1.setPause(False).run(sender = admin)
        scenario.verify(c1.data.balances[alice.address].balance == 9)
        scenario += c1.transfer(f = alice.address, t = bob.address, amount = 1).run(sender = alice)

        scenario.verify(c1.data.totalSupply == 17)
        scenario.verify(c1.data.balances[alice.address].balance == 8)
        scenario.verify(c1.data.balances[bob.address].balance == 9)
        
       