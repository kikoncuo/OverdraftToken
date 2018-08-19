const { assertRevert } = require('./helpers/assertRevert');
const { assertException } = require('./helpers/assertException');
const expectEvent = require('./helpers/expectEvent');

const OverdraftToken = artifacts.require('OverdraftToken');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('OverdraftToken', function ([owner, recipient, anotherAccount, overdraftedAccount]) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  beforeEach(async function () {
    this.token = await OverdraftToken.new();
  });

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      (await this.token.totalSupply()).should.be.bignumber.equal(100);
    });
  });

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        (await this.token.balanceOf(anotherAccount)).should.be.bignumber.equal(0);
      });
    });

    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        (await this.token.balanceOf(owner)).should.be.bignumber.equal(100);
      });
    });
  });

  describe('transfer', function () {
    describe('when the recipient is not the zero address', function () {
      const to = recipient;

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('reverts', async function () {
          await assertRevert(this.token.transfer(to, amount, { from: owner }));
        });
      });

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('transfers the requested amount', async function () {
          await this.token.transfer(to, amount, { from: owner });

          (await this.token.balanceOf(owner)).should.be.bignumber.equal(0);

          (await this.token.balanceOf(to)).should.be.bignumber.equal(amount);
        });

        it('emits a transfer event', async function () {
          const { logs } = await this.token.transfer(to, amount, { from: owner });

          const event = expectEvent.inLogs(logs, 'Transfer', {
            from: owner,
            to: to,
          });

          event.args.value.should.be.bignumber.equal(amount);
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS;

      it('reverts', async function () {
        await assertRevert(this.token.transfer(to, 100, { from: owner }));
      });
    });
  });

  describe('approve', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('emits an approval event', async function () {
          const { logs } = await this.token.approve(spender, amount, { from: owner });

          logs.length.should.eq(1);
          logs[0].event.should.eq('Approval');
          logs[0].args.owner.should.eq(owner);
          logs[0].args.spender.should.eq(spender);
          logs[0].args.value.should.be.bignumber.equal(amount);
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.approve(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner });
          });

          it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await this.token.approve(spender, amount, { from: owner });

          logs.length.should.eq(1);
          logs[0].event.should.eq('Approval');
          logs[0].args.owner.should.eq(owner);
          logs[0].args.spender.should.eq(spender);
          logs[0].args.value.should.be.bignumber.equal(amount);
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.approve(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner });
          });

          it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });
      });
    });

    describe('when the spender is the zero address', function () {
      const amount = 100;
      const spender = ZERO_ADDRESS;

      it('approves the requested amount', async function () {
        await this.token.approve(spender, amount, { from: owner });

        (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
      });

      it('emits an approval event', async function () {
        const { logs } = await this.token.approve(spender, amount, { from: owner });

        logs.length.should.eq(1);
        logs[0].event.should.eq('Approval');
        logs[0].args.owner.should.eq(owner);
        logs[0].args.spender.should.eq(spender);
        logs[0].args.value.should.be.bignumber.equal(amount);
      });
    });
  });

  describe('transfer from', function () {
    const spender = recipient;

    describe('when the recipient is not the zero address', function () {
      const to = anotherAccount;

      describe('when the spender has enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, 100, { from: owner });
        });

        describe('when the owner has enough balance', function () {
          const amount = 100;

          it('transfers the requested amount', async function () {
            await this.token.transferFrom(owner, to, amount, { from: spender });

            (await this.token.balanceOf(owner)).should.be.bignumber.equal(0);

            (await this.token.balanceOf(to)).should.be.bignumber.equal(amount);
          });

          it('decreases the spender allowance', async function () {
            await this.token.transferFrom(owner, to, amount, { from: spender });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(0);
          });

          it('emits a transfer event', async function () {
            const { logs } = await this.token.transferFrom(owner, to, amount, { from: spender });

            logs.length.should.eq(1);
            logs[0].event.should.eq('Transfer');
            logs[0].args.from.should.eq(owner);
            logs[0].args.to.should.eq(to);
            logs[0].args.value.should.be.bignumber.equal(amount);
          });
        });

        describe('when the owner does not have enough balance', function () {
          const amount = 101;

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
          });
        });
      });

      describe('when the spender does not have enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, 99, { from: owner });
        });

        describe('when the owner has enough balance', function () {
          const amount = 100;

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
          });
        });

        describe('when the owner does not have enough balance', function () {
          const amount = 101;

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
          });
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      const amount = 100;
      const to = ZERO_ADDRESS;

      beforeEach(async function () {
        await this.token.approve(spender, amount, { from: owner });
      });

      it('reverts', async function () {
        await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
      });
    });
  });

  describe('decrease approval', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        const amount = 100;

        it('emits an approval event', async function () {
          const { logs } = await this.token.decreaseApproval(spender, amount, { from: owner });

          logs.length.should.eq(1);
          logs[0].event.should.eq('Approval');
          logs[0].args.owner.should.eq(owner);
          logs[0].args.spender.should.eq(spender);
          logs[0].args.value.should.be.bignumber.equal(0);
        });

        describe('when there was no approved amount before', function () {
          it('keeps the allowance to zero', async function () {
            await this.token.decreaseApproval(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(0);
          });
        });

        describe('when the spender had an approved amount', function () {
          const approvedAmount = amount;

          beforeEach(async function () {
            await this.token.approve(spender, approvedAmount, { from: owner });
          });

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await this.token.decreaseApproval(spender, approvedAmount - 5, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(5);
          });

          it('sets the allowance to zero when all allowance is removed', async function () {
            await this.token.decreaseApproval(spender, approvedAmount, { from: owner });
            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(0);
          });

          it('sets the allowance to zero when more than the full allowance is removed', async function () {
            await this.token.decreaseApproval(spender, approvedAmount + 5, { from: owner });
            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(0);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await this.token.decreaseApproval(spender, amount, { from: owner });

          logs.length.should.eq(1);
          logs[0].event.should.eq('Approval');
          logs[0].args.owner.should.eq(owner);
          logs[0].args.spender.should.eq(spender);
          logs[0].args.value.should.be.bignumber.equal(0);
        });

        describe('when there was no approved amount before', function () {
          it('keeps the allowance to zero', async function () {
            await this.token.decreaseApproval(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(0);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, amount + 1, { from: owner });
          });

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await this.token.decreaseApproval(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(1);
          });
        });
      });
    });

    describe('when the spender is the zero address', function () {
      const amount = 100;
      const spender = ZERO_ADDRESS;

      it('decreases the requested amount', async function () {
        await this.token.decreaseApproval(spender, amount, { from: owner });

        (await this.token.allowance(owner, spender)).should.be.bignumber.equal(0);
      });

      it('emits an approval event', async function () {
        const { logs } = await this.token.decreaseApproval(spender, amount, { from: owner });

        logs.length.should.eq(1);
        logs[0].event.should.eq('Approval');
        logs[0].args.owner.should.eq(owner);
        logs[0].args.spender.should.eq(spender);
        logs[0].args.value.should.be.bignumber.equal(0);
      });
    });
  });

  describe('increase approval', function () {
    const amount = 100;

    describe('when the spender is not the zero address', function () {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseApproval(spender, amount, { from: owner });

          logs.length.should.eq(1);
          logs[0].event.should.eq('Approval');
          logs[0].args.owner.should.eq(owner);
          logs[0].args.spender.should.eq(spender);
          logs[0].args.value.should.be.bignumber.equal(amount);
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseApproval(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner });
          });

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseApproval(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount + 1);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = 101;

        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseApproval(spender, amount, { from: owner });

          logs.length.should.eq(1);
          logs[0].event.should.eq('Approval');
          logs[0].args.owner.should.eq(owner);
          logs[0].args.spender.should.eq(spender);
          logs[0].args.value.should.be.bignumber.equal(amount);
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseApproval(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner });
          });

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseApproval(spender, amount, { from: owner });

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount + 1);
          });
        });
      });
    });

    describe('when the spender is the zero address', function () {
      const spender = ZERO_ADDRESS;

      it('approves the requested amount', async function () {
        await this.token.increaseApproval(spender, amount, { from: owner });

        (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
      });

      it('emits an approval event', async function () {
        const { logs } = await this.token.increaseApproval(spender, amount, { from: owner });

        logs.length.should.eq(1);
        logs[0].event.should.eq('Approval');
        logs[0].args.owner.should.eq(owner);
        logs[0].args.spender.should.eq(spender);
        logs[0].args.value.should.be.bignumber.equal(amount);
      });
    });

  });

  describe('onlyOwner', function () {
    describe('when someone other than the owner calls an onlyOwner function', function () {
      it('throws', async function () {
        await assertRevert(this.token.pauseReceive(recipient, { from: anotherAccount }));
      });
    });
  });

  describe('editOverdraft', function () {
    const overdraftAmount = 100;
    describe('when the maximum overdraft amount is increased', function () {
      it('the balance increases old balance + overdraft', async function () {
        const oldBalance = await this.token.balanceOf(owner);
        await this.token.editOverdraft(owner, overdraftAmount, { from: owner });
        (await this.token.balanceOf(owner)).should.be.bignumber.equal( parseInt(oldBalance) + parseInt(overdraftAmount));
      });
    });
    it('emits an OverdraftChanged event', async function () {
      const { logs } = await this.token.editOverdraft(overdraftedAccount, overdraftAmount, { from: owner });
      logs.length.should.eq(1);
      logs[0].event.should.eq('OverdraftChanged');
      logs[0].args.addressChanged.should.eq(overdraftedAccount);
      logs[0].args.overdraftChanger.should.eq(owner);
      logs[0].args.overdraftAmount.should.be.bignumber.equal(overdraftAmount);
    });

    describe('when the account can make a transfer using new maximum overdraft', function () {
      it('transfers the requested amount', async function () {
        const newBalance = await this.token.balanceOf(owner);
        await this.token.transfer(anotherAccount, newBalance, { from: owner });
        (await this.token.balanceOf(owner)).should.be.bignumber.equal(0);
        (await this.token.balanceOf(anotherAccount)).should.be.bignumber.equal(newBalance);
      });
    });

    describe('when the maximum overdraft is reduced and new limit surpases current overdraft', function () {
      const oldOverdraft = 100;
      const newOverdraft = 50;
      it('throws', async function () {
        await this.token.editOverdraft(owner, oldOverdraft, { from: owner });
        await this.token.transfer(anotherAccount, await this.token.balanceOf(owner), { from: owner });
        await assertException(this.token.editOverdraft(owner, newOverdraft, { from: owner }));
      });
    });
  });

  describe('pauseReceive', function () {
    describe('when an account\'s ability to receive is paused', function () {
      const amount = 50;
      it('transactions throw when that account is a transaction\'s destination', async function () {
        await this.token.pauseReceive(recipient, { from: owner });
        await assertRevert(this.token.transfer(recipient, amount, { from: owner }));
      });
      it('emits an ReceivePaused event', async function () {
        const { logs } = await this.token.pauseReceive(recipient, { from: owner });
        logs.length.should.eq(1);
        logs[0].event.should.eq('ReceivePaused');
        logs[0].args.addressChanged.should.eq(recipient);
        logs[0].args.changer.should.eq(owner);
      });
    });
  });

  describe('unpauseReceive', function () {
    describe('when an account\'s ability to receive is paused', function () {
      const amount = 50;
      it('transactions throw when that account is a transaction\'s destination', async function () {
        await this.token.pauseReceive(recipient, { from: owner });
        await this.token.unpauseReceive(recipient, { from: owner });
        await this.token.transfer(recipient, amount, { from: owner });
        (await this.token.balanceOf(recipient)).should.be.bignumber.equal(amount);
      });
      it('emits an ReceiveUnpaused event', async function () {
        const { logs } = await this.token.unpauseReceive(recipient, { from: owner });
        logs.length.should.eq(1);
        logs[0].event.should.eq('ReceiveUnpaused');
        logs[0].args.addressChanged.should.eq(recipient);
        logs[0].args.changer.should.eq(owner);
      });
    });
  });

  describe('pauseTransfer', function () {
    describe('when an account\'s ability to transfer is paused', function () {
      const amount = 50;
      it('transactions throw when that account is a transaction\'s sender', async function () {
        await this.token.pauseTransfer(owner, { from: owner });
        await assertRevert(this.token.transfer(recipient, amount, { from: owner }));
      });
      it('emits an TransferPaused event', async function () {
        const { logs } = await this.token.pauseTransfer(recipient, { from: owner });
        logs.length.should.eq(1);
        logs[0].event.should.eq('TransferPaused');
        logs[0].args.addressChanged.should.eq(recipient);
        logs[0].args.changer.should.eq(owner);
      });
    });
  });

  describe('unpauseTransfer', function () {
    describe('when an account\'s ability to transfer is paused', function () {
      const amount = 50;
      it('transactions throw when that account is a transaction\'s sender', async function () {
        await this.token.pauseTransfer(owner, { from: owner });
        await this.token.unpauseTransfer(owner, { from: owner });
        await this.token.transfer(recipient, amount, { from: owner });
        (await this.token.balanceOf(recipient)).should.be.bignumber.equal(amount);
      });
      it('emits an TransferUnpaused event', async function () {
        const { logs } = await this.token.unpauseTransfer(recipient, { from: owner });
        logs.length.should.eq(1);
        logs[0].event.should.eq('TransferUnpaused');
        logs[0].args.addressChanged.should.eq(recipient);
        logs[0].args.changer.should.eq(owner);
      });
    });
  });

});
