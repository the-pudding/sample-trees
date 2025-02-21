PHONY: github pudding

github:
	@if ! git diff-index --quiet HEAD --; then \
		echo "Warning: You have uncommitted changes. Do you want to continue? (y/n)"; \
		read ans; \
		if [ "$$ans" != "y" ]; then \
			echo "Aborting deployment."; \
			exit 1; \
		fi; \
	fi
	rm -rf docs
	cp -r build docs
	touch docs/.nojekyll
	git add -A
	git commit -m "update github pages"
	git push
	
# aws-sync:
# 	aws s3 sync build s3://pudding.cool/year/month/name --delete --cache-control 'max-age=31536000'

# aws-cache:
# 	aws cloudfront create-invalidation --distribution-id E13X38CRR4E04D --paths '/year/month/name*'	

# pudding: aws-sync aws-cache